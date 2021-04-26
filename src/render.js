const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { get, map, flatMap } = require('./util');

// TODO cache files?

const cheerioOptions = {
  xmlMode: true,
};

let sourceDir = '';

const handleMap = async (pages, tag, data) => {
  return flatMap(pages, async (page) => {
    const { html } = page;

    const node = html(tag).first();
    const children = node.children();
    const dataPath = node[0].attribs.data;
    const items = get(data, dataPath, []);
  
    for (let i = 0; i < items.length; i++) {
      const child = children.clone();
      child.attr('data', `${dataPath}.${i}`);
      node.after(child);
    }
    node.remove();
  
    return [{
      ...page,
      html,
    }];
  })
};

const handleInclude = async (pages, tag) => {
  return flatMap(pages, async (page) => {
    const { html } = page;

    const node = html(tag).first();
    const file = node[0].attribs.html;
    const includes = await render(`${file}.html`);

    return map(includes, async ({ html: include }) => {
      const node = html(tag).first();
      node.replaceWith(include);

      return {
        ...page,
        html,
      };
    });
  });
};

const handleRoutes = async (pages, tag) => {
  return flatMap(pages, async (page) => {
    const { html } = page;

    const node = html(tag).first();
    const children = node.children();
    const routes = [];
    for (let i = 0; i < children.length; i++) {
      routes.push(children[i]);
    }

    return map(routes, (route) => {
      const newHtml = cheerio.load(html.html(), cheerioOptions);
      const node = newHtml(tag).first();
      const routePath = route.attribs.path || route.attribs.html;
      node.replaceWith(route);
      return {
        route: routePath,
        html: newHtml,
      };
    });
  });
};

const stableTags = [
  // {
  //   tag: 'stable-define',
  //   handle: handleDefine,
  // },
  // {
  //   tag: 'stable-if',
  //   handle: handleIf,
  // },
  {
    tag: 'stable-map',
    handle: handleMap,
  },
  {
    tag: 'stable-include',
    handle: handleInclude,
  },
  {
    tag: 'stable-routes',
    handle: handleRoutes,
  },
];

const render = async (fileName, data) => {
  const filePath = path.join(sourceDir, fileName);
  const file = await fs.readFile(filePath);
  const html = cheerio.load(file, cheerioOptions);

  let pages = [{
    route: fileName.replace('.html', ''),
    html,
  }];

  for (const stableTag of stableTags) {
    const { tag, handle } = stableTag;
    const nodes = html(tag);
    for (let i = 0; i < nodes.length; i++) {
      pages = await handle(pages, tag, data);
    }
  }

  return pages.map((page) => ({
    ...page,
    html: page.html.html(),
  }));
};

const init = (options, data) => {
  const { source, entry } = options;
  sourceDir = source;
  return render(entry, data);
};

module.exports = {
  init,
};
