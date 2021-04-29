const fs = require('fs').promises;
const path = require('path');

let sourceDir = '.';
const store = [];

const init = dir => sourceDir = dir;

const save = (id, html) => {
  store.push({
    id,
    html,
  });
};

const load = async (id) => {
  const cachedTemplate = store.find(template => template.id === id);
  if (cachedTemplate) return cachedTemplate.html;

  const file = path.join(sourceDir, `${id}.html`);
  const html = await fs.readFile(file);

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
