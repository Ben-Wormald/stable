const cheerio = require('cheerio');
const fs = require('fs').promises;

// TODO cache files?

const options = {
  xmlMode: true,
};

const handleInclude = async (node) => {
  const file = node[0].attribs.html;
  const include = await render(`src/${file}.html`);
  node.replaceWith(include.html());
};

const handleMap = async (node) => {
  const file = node[0].attribs.html;
  const include = await render(`src/${file}.html`);
  node.replaceWith(include.html());
};

const stableTags = [
  {
    tag: 'stable-include',
    handle: handleInclude,
  },
  // {
  //   tag: 'stable-map',
  //   handle: handleMap,
  // },
];

const render = async (path, data) => {
  const file = await fs.readFile(path);
  const html = cheerio.load(file, options);

  for (const stableTag of stableTags) {
    const { tag, handle } = stableTag;
    const nodes = html(tag);
    for (let i = 0; i < nodes.length; i++) {
      const node = html(tag).first();
      await handle(node);
    }
  }

  return html;
};

module.exports = {
  render,
};
