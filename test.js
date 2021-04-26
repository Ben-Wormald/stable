const { hydrate } = require('./src/stable');

const options = {
  source: 'test',
  output: 'dist',
  entry: 'index.html',
};

const data = {
  posts: [
    {
      id: 1,
      title: 'hello',
    },
    {
      id: 2,
      title: 'hi',
    },
  ],
};

const run = async () => {
  const pages = await hydrate(options, data);
  pages.forEach((page) => {
    console.log(page.route);
    console.log(page.html);
  });
};

run();
