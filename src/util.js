const { xml2json, json2xml } = require('xml-js');

// const xmlParser = xml2js.Parser({
//   preserveChildrenOrder: true,
//   explicitChildren: true,
//   attrkey: 'stable-attr',
//   charkey: 'stable-char',
//   childkey: 'stable-child',
//   // explicitRoot: false,
// });

// const xmlBuilder = new xml2js.Builder({
//   // rootName: 'stable-root',
// });

const shorthands = [
  {
    tag: 'stable-define',
    symbol: '=',
  },
  {
    tag: 'stable-if',
    symbol: '?',
  },
  {
    tag: 'stable-map',
    symbol: '#',
  },
  {
    tag: 'stable-include',
    symbol: '@',
  },
  {
    tag: 'stable-routes',
    symbol: '*',
  },
  {
    tag: 'stable-route',
    symbol: '+',
  },
];

const placeholder = /\{[a-zA-Z0-9_.-]+\}/g;

const expand = (string) => {
  console.log('expand', string);
  const result = shorthands.reduce(
    (input, { tag, symbol}) => input
      .split(`<${symbol}`).join(`<${tag}`)
      .split(`</${symbol}`).join(`</${tag}`),
    string,
  );
  console.log(result);
  return result;
};

const hydrate = (string, data) => {
  let matches = string.match(placeholder) || [];

  return matches.reduce((output, match) => {
    const key = match.slice(1, -1);
    const value = get(data, key);
    return output.split(match).join(value);
  }, string);
};

const evaluate = (expression, data) => {
  const entries = Object.entries(data);
  const keys = entries.map(entry => entry[0]);
  const values = entries.map(entry => entry[1]);

  const statement = `return ${expression};`;
  const f = new Function(...keys, statement);

  try {
    const result = f(...values);
    return result;
  } catch (e) {
    return null;
  }
};

const get = (obj, path, defValue) => {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  return (
    pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj) || defValue
  );
};

const map = (array, f) => Promise.all(array.map(f));

const flatten = (arr) => [].concat(...arr);

const flatMap = async (array, f) => Promise.all(flatten(await map(array, f)));

const parse = (htmlString) => {
  const xmlString = `<stable-root>${htmlString}</stable-root>`;
  const jsonString = xml2json(xmlString);
  const root = JSON.parse(jsonString);
  return root.elements[0].elements;
};

module.exports = {
  expand,
  hydrate,
  evaluate,
  get,
  map,
  flatMap,
  parse,
};
