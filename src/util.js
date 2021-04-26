const expansion = /\{[a-zA-Z0-9_.-]+\}/g;

const expand = (string, data) => {
  let matches = string.match(expansion) || [];

  return matches.reduce((output, match) => {
    const key = match.slice(1, -1);
    const value = get(data, key);
    return output.split(match).join(value);
  }, string);
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
  get,
  map,
  flatMap,
};
