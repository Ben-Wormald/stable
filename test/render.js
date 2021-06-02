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

t.test('maps stable elements with data', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.mapInclude,
    } },
  });

  const data = {
    items: [
      { testData: 'one' },
      { testData: 'two' },
      { testData: 'three' },
    ],
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>one</p><p>two</p><p>three</p></div>');
  t.end()
});

t.test('maps stable elements with specified data', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.mapIncludeData,
    } },
  });

  const data = {
    items: [
      { testData: { testSubData: 'one' } },
      { testData: { testSubData: 'two' } },
      { testData: { testSubData: 'three' } },
    ],
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>one</p><p>two</p><p>three</p></div>');
  t.end()
});

t.test('maps HTML elements with data', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.mapHtml,
    } },
  });

  const data = {
    items: [
      { testData: 'one' },
      { testData: 'two' },
      { testData: 'three' },
    ],
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><span>one</span><span>two</span><span>three</span></div>');
  t.end()
});

t.test('maps HTML elements as value', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.mapHtmlAs,
    } },
  });

  const data = {
    items: [
      'one',
      'two',
      'three',
    ],
  };

  const actual = await renderRoot(defaultOptions, data);

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><span>one</span><span>two</span><span>three</span></div>');
  t.end()
});

t.test('includes an external file', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: (file) => {
        if (file === 'src/index.html') {
          return '<div><stable-include html="test-file" /></div>';
        } else if (file === 'src/test-file.html') {
          return '<p>test</p>';
        }
      },
    } },
  });

  const actual = await renderRoot(defaultOptions, {});

  t.equal(actual.length, 1);
  t.equal(actual[0].route, 'index');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>test</p></div>');
  t.end()
});

t.only('renders routes', async t => {
  const { renderRoot } = t.mock('../src/render', {
    fs: { promises: {
      readFile: () => fixtures.routes,
    } },
  });

  const actual = await renderRoot(defaultOptions, {
    path: 'data-path',
    testData: 'hi',
    moreData: {
      path: 'sub-data-path',
      testData: 'hello',
    },
  });

  t.equal(actual.length, 5);
  t.equal(actual[0].route, '/test-component');
  t.equal(actual[1].route, '/index');
  t.equal(actual[2].route, '/test');
  t.equal(actual[3].route, '/data-path');
  t.equal(actual[4].route, '/sub-data-path');
  t.equal(actual[0].html.replace(/\s+/g, ''), '<div><p>hi</p></div>');
  t.equal(actual[1].html.replace(/\s+/g, ''), '<div><p>hi</p></div>');
  t.equal(actual[2].html.replace(/\s+/g, ''), '<div><p>hi</p></div>');
  t.equal(actual[3].html.replace(/\s+/g, ''), '<div><p>hi</p></div>');
  t.equal(actual[4].html.replace(/\s+/g, ''), '<div><p>hello</p></div>');
  t.end()
});
