const { render } = require('./stable');

const source = 'src';
const entry = 'src/index.html';

const data = {
  posts: [
    {
      title: 'hello',
    },
  ],
};

const run = async () => {
  const pages = await render(entry, data);
  pages.forEach(page => console.log(page));
};

run();
