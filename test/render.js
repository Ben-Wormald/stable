const t = require('tap');
const fixtures = require('./fixtures');

const defaultOptions = {
  source: 'src',
  entry: 'index.html',
  output: 'dist',
  stripExtension: false,
  enableShorthand: false,
};

t.test('renders one page', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => '<div>hello</div>',
    } },
  });

  const actual = await renderRoot(defaultOptions, {});

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html, '<div>hello</div>');
  t.end()
});

t.test('renders defined html', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.define,
    } },
  });

  const actual = await renderRoot(defaultOptions, {});

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>hi</p></div>');
  t.end()
});

t.test('evaluates if blocks', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.ifs,
    } },
  });

  const data = {
    testData: true,
    testDataFalse: false,
    subData: {
      subTestData: true,
    },
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>yes</p><p>yes</p><p>yes</p></div>');
  t.end()
});

t.test('evaluates map block', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.map,
    } },
  });

  const data = {
    items: [1, 2, 3],
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>item</p><p>item</p><p>item</p></div>');
  t.end()
});
