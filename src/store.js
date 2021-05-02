const fs = require('fs').promises;
const path = require('path');
const { expand } = require('./util');

let sourceDir = '.';
let shouldExpand = false;
const store = [];

const init = ({ source, enableShorthand }) => {
  sourceDir = source;
  shouldExpand = enableShorthand;
};

const save = (id, html) => {
  store.push({
    id,
    html: shouldExpand ? expand(html) : html,
  });
};

const load = async (id) => {
  const cachedTemplate = store.find(template => template.id === id);
  if (cachedTemplate) return cachedTemplate.html;

  const file = path.join(sourceDir, `${id}.html`);
  let html = await fs.readFile(file, { encoding: 'utf-8' });

  if (shouldExpand) html = expand(html);

  store.push({
    id,
    html,
  });

  return html;
};

module.exports = {
  init,
  save,
  load,
};
