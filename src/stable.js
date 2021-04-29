const fs = require('fs').promises;
const path = require('path');
const prettify = require('html-prettify');
const { renderRoot } = require('./render');
const { map } = require('./util');

const defaultOptions = {
  source: 'src',
  entry: 'index.html',
  output: 'dist',
  extension: true,
};

const hydrate = async (userOptions = {}, data = {}) => {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  const pages = await renderRoot(options, data);
  const prettifiedPages = pages.map(page => ({
    ...page,
    html: prettify(page.html),
  }));
  return write(prettifiedPages, options);
};

const write = (pages, options) => {
  const { output, extension } = options;
  return map(pages, async (page) => {
    const { route, html } = page;
    const fileName = extension ? `${route}.html` : route;
    const filePath = path.join(process.cwd(), output, fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, html);
  });
};

module.exports = {
  hydrate,
};
