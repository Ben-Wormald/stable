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
      hasImage: true,
    },
    {
      id: 2,
      title: 'hi',
    },
  ],
};

const run = async () => {
  await hydrate(options, data);
  console.log('done');
};

run();
