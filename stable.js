const cheerio = require('cheerio');
const fs = require('fs').promises;
const { get, map, flatMap } = require('./util');

// TODO cache files?

const options = {
  xmlMode: true,
};

const handleMap = async (pages, tag, data) => {
  return map(pages, async ({ html }) => {
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
  
    return {
      html,
    };
  })
};

const handleInclude = async (pages, tag) => {
  return flatMap(pages, async ({ html }) => {
    const node = html(tag).first();
    const file = node[0].attribs.html;

    const newPages = await render(`src/${file}.html`);
    return map(newPages, async ({ html: include }) => {
      // const newHtml = html.root().clone();
      // console.log(newHtml);
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
    const pages = [];
    for (let i = 0; i < children.length; i++) {
      // const page = html.clone();
      pages.push({
        route: '',
        // html: page,
        html,
      });
    }
    return pages;
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

const render = async (path, data) => {
  const file = await fs.readFile(path);
  const html = cheerio.load(file, options);

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

  console.log(pages);

  const newPages = pages.map(page => ({
    ...page,
    html: page.html(),
  }));

  console.log(newPages);

  return newPages;
};

module.exports = {
  render,
};
