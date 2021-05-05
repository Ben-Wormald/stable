const fs = require('fs').promises;
const path = require('path');
const pretty = require('pretty');
const { renderRoot } = require('./render');
const { map } = require('./util');

const defaultOptions = {
  source: 'src',
  entry: 'index.html',
  output: 'dist',
  stripExtension: false,
  enableShorthand: false,
};

const hydrate = async (userOptions = {}, data = {}) => {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  const pages = await renderRoot(options, data);
  const formattedPages = pages.map(page => ({
    ...page,
    html: pretty(page.html, { ocd: true }),
  }));

  await write(formattedPages, options);
  
  const count = formattedPages.length;
  console.log(`done! generated ${count} file${count === 1 ? '' : 's'}`);
};

const write = (pages, options) => {
  const { output, stripExtension } = options;
  return map(pages, async (page) => {
    const { route, html } = page;
    const fileName = stripExtension ? route : `${route}.html`;
    const filePath = path.join(process.cwd(), output, fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, html);
  });
};

module.exports = {
  hydrate,
};
