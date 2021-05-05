const { hydrate } = require('../src/stable');

const options = {
  source: 'example-src',
  entry: 'index.html', // default
  output: 'example-dist',
  stripExtension: false, // default
  enableShorthand: false, // default
};

const data = {
  footerContent: '(C) MMXXI',
  posts: [
    {
      id: 1,
      title: 'My first post',
      date: '1st January 2021',
      imageSrc: 'https://www.fillmurray.com/420/360',
      content: 'Hello!',
    },
    {
      id: 2,
      date: '1st May 2021',
      title: 'Test post please ignore',
      content: 'Lorem ipsum dolor sit amet,',
    },
  ],
};

const run = async () => {
  await hydrate(options, data);
};

run();
