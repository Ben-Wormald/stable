const t = require('tap');
const { expand } = require('../src/util');

t.test('expands shorthand tags', async t => {
  const input = `<=></=><?></?><#></#><@ /><*><+ /></*>`;
  const expected = `<stable-define></stable-define><stable-if></stable-if><stable-map></stable-map><stable-include /><stable-routes><stable-route /></stable-routes>`;

  const actual = await expand(input);

  t.equal(actual, expected);
  t.end()
});
