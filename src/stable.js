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
  return flatMap(pages, async ({ html }) => {
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
      html,
    }];
  })
};

const handleInclude = async (pages, tag) => {
  return flatMap(pages, async ({ html }) => {
    const node = html(tag).first();
    const file = node[0].attribs.html;

    const includes = await hydrate(`${file}.html`);
    return map(includes, async ({ html: include }) => {
      const node = html(tag).first();
      node.replaceWith(include);
      return {
        html,
      };
    });
  });
};

const handleRoutes = async (pages, tag) => {
  return flatMap(pages, async ({ html }) => {
    const node = html(tag).first();
    const children = node.children();
    const routes = [];

    for (let i = 0; i < children.length; i++) {
      routes.push(children[i]);
    }

    return map(routes, (route) => {
      const newHtml = cheerio.load(html.html(), cheerioOptions);
      const node = newHtml(tag).first();
      node.replaceWith(route);
      return {
        route: '',
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

const hydrate = async (fileName, data) => {
  const filePath = path.resolve(sourceDir, fileName);
  const file = await fs.readFile(filePath);
  const html = cheerio.load(file, cheerioOptions);

  let pages = [{
    html,
  }];

  for (const stableTag of stableTags) {
    const { tag, handle } = stableTag;
    const nodes = html(tag);
    for (let i = 0; i < nodes.length; i++) {
      pages = await handle(pages, tag, data);
    }
  }

  return pages.map(page => ({
    ...page,
    html: page.html.html(),
  }));
};

const init = (options, data) => {
  sourceDir = options.sourceDir;
  return hydrate(options.entry, data);
};

module.exports = {
  hydrate: init,
};
