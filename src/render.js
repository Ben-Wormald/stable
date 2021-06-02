const cheerio = require('cheerio');
const { hydrate, evaluate, get, map, flatMap } = require('./util');
const { init, save, load } = require('./store');

const cheerioOptions = {
  xmlMode: true,
  decodeEntities: false,
};

const handleTag = (stableTag, pages, parentData) => {
  const { tag, handler } = stableTag;
  return flatMap(pages, (page) => {
    const node = page.html(tag).first();

    const dataPath = node[0].attribs.data;
    const localData = dataPath ? get(parentData, dataPath) : {};
    const data = {
      ...parentData,
      ...localData,
    };

    Object.entries(node[0].attribs).forEach(
      ([key, value]) => node.attr(key, hydrate(value, data))
    );

    return handler(page, tag, data)
  });
};

const handleDefine = async (page, tag, data) => {
  const { html } = page;
  const node = html(tag).first();

  const id = node[0].attribs.html;
  const htmlString = node.html();
  save(id, htmlString);
  
  node.remove();

  return [{
    ...page,
    html,
  }];
};

const handleIf = async (page, tag, data) => {
  const { html } = page;
  const node = html(tag).first();

  const condition = node[0].attribs.condition;
  const isTrue = !!evaluate(condition, data);
  
  if (isTrue) {
    const content = node.clone().html();
    node.replaceWith(content);
  } else {
    node.remove();
  }

  return [{
    ...page,
    html,
  }];
};

const handleMap = async (page, tag, data) => {
  const { html } = page;
  const node = html(tag).first();

  const children = node.children();
  const itemsPath = node[0].attribs.items;
  const itemsAs = node[0].attribs.as;
  const items = get(data, itemsPath, []);
  items.reverse();

  for (let i = 0; i < items.length; i++) {
    const child = children.clone();
    const childData = data[itemsPath][i];

    let mergedData;
    if (itemsAs) {
      mergedData = {
        ...data,
        [itemsAs]: childData,
      };
    } else {
      mergedData = {
        ...data,
        ...childData,
      };
    }

    const isStableTag = stableTags.find(({ tag }) => child[0] && tag === child[0].name);

    let output;
    if (!isStableTag) {
      output = hydrate(child.toString(), mergedData);
    } else {
      const childDataPath = child[0] && child[0].attribs.data;
      if (!childDataPath) {
        child.attr('data', `${itemsPath}.${i}`);
      } else {
        child.attr('data', `${itemsPath}.${i}.${childDataPath}`);
      };
      output = child;
    }

    node.after(output);
  }
  node.remove();

  return [{
    ...page,
    html,
  }];
};

const handleInclude = async (page, tag, data) => {
  const { html } = page;
  const node = html(tag).first();

  const id = node[0].attribs.html;
  const includes = await render(id, data);

  return map(includes, async ({ html: include }) => {
    const node = html(tag).first();
    node.replaceWith(include);

    return {
      ...page,
      html,
    };
  });
};

const handleRoutes = async (page, tag, data) => {
  const { html } = page;
  const node = html(tag).first();

  const children = node.children();
  const routes = [];
  for (let i = 0; i < children.length; i++) {
    routes.push(children[i]);
  }

  return map(routes, (route) => {
    const newHtml = cheerio.load(html.html(), cheerioOptions);
    const node = newHtml(tag).first();

    let routePath = route.attribs.path || `/${route.attribs.html}`;
    if (routePath === '/') routePath = '/index';

    let routeData = route.attribs.data ? get(data, route.attribs.data) : data;
    routePath = hydrate(routePath, routeData);

    node.replaceWith(route);
    return {
      route: routePath,
      html: newHtml,
    };
  });
};

const stableTags = [
  {
    tag: 'stable-define',
    handler: handleDefine,
  },
  {
    tag: 'stable-if',
    handler: handleIf,
  },
  {
    tag: 'stable-map',
    handler: handleMap,
  },
  {
    tag: 'stable-include',
    handler: handleInclude,
  },
  {
    tag: 'stable-routes',
    handler: handleRoutes,
  },
  {
    tag: 'stable-route',
    handler: handleInclude,
  },
];

const pageHasTag = (pages, stableTag) => {
  const { tag } = stableTag;
  return pages.reduce((hasTag, page) => {
    if (!hasTag) {
      hasTag = page.html(tag).length > 0;
    }
    return hasTag;
  }, false);
};

const render = async (id, data) => {
  const htmlString = await load(id);
  const html = cheerio.load(htmlString, cheerioOptions);

  let pages = [{
    route: id,
    html,
  }];

  for (const stableTag of stableTags) {
    while (pageHasTag(pages, stableTag)) {
      pages = await handleTag(stableTag, pages, data);
    }
  }

  return pages.map((page) => ({
    ...page,
    html: hydrate(page.html.html(), data),
  }));
};

const renderRoot = (options, data) => {
  const { entry } = options;
  init(options);
  const entryId = entry.replace('.html', '');
  return render(entryId, data);
};

module.exports = {
  renderRoot,
};
