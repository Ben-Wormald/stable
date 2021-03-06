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

const placeholder = /\{\{[a-zA-Z0-9_.-]+\}\}/g;

const expand = (string) => {
  return shorthands.reduce(
    (input, { tag, symbol}) => input
      .split(`<${symbol}`).join(`<${tag}`)
      .split(`</${symbol}`).join(`</${tag}`),
    string,
  );
};

const hydrate = (string, data) => {
  let matches = string.match(placeholder) || [];

  return matches.reduce((output, match) => {
    const key = match.slice(2, -2);
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

module.exports = {
  expand,
  hydrate,
  evaluate,
  get,
  map,
  flatMap,
};
