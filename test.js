const { render } = require('./stable');

const entry = 'src/index.html';

const data = {
  posts: [
    {
      title: 'hello',
    },
  ],
};

const run = async () => {
  const result = await render(entry, data);
  console.log(result.html());
};

run();
