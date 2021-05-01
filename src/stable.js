const fs = require('fs').promises;
const path = require('path');
const pretty = require('pretty');
const { renderRoot } = require('./render');
const { map } = require('./util');

const defaultOptions = {
  source: 'src',
  entry: 'index.html',
  output: 'dist',
  extension: true,
  expand: false,
};

const hydrate = async (userOptions = {}, data = {}) => {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  const pages = await renderRoot(options, data);
  const formattedPages = pages.map(page => ({
    ...page,
    html: stripBlankLines(pretty(page.html)),
  }));
  return write(formattedPages, options);
};

const stripBlankLines = html => `${html.split('\n').filter(line => line.length).join('\n')}\n`;

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
