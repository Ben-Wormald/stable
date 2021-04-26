const fs = require('fs').promises;
const path = require('path');
const { init } = require('./render');
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

  const pages = await init(options, data);
  return write(pages, options);
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
