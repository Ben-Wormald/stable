const define = `
<stable-define html="test-component">
  <p>hi</p>
</stable-define>

<div>
  <stable-include html="test-component" />
</div>`;

const ifs = `
<div>
  <stable-if condition="true">
    <p>yes</p>
  </stable-if>
  <stable-if condition="false">
    <p>no</p>
  </stable-if>
  <stable-if condition="testData">
    <p>yes</p>
  </stable-if>
  <stable-if condition="testDataFalse">
    <p>no</p>
  </stable-if>
  <stable-if condition="nonexistentData">
    <p>no</p>
  </stable-if>
  <stable-if condition="subTestData" data="subData">
    <p>yes</p>
  </stable-if>
</div>`;

const mapInclude = `
<stable-define html="test-component">
  <p>{{testData}}</p>
</stable-define>

<div>
  <stable-map items="items">
    <stable-include html="test-component" />
  </stable-map>
</div>`;

const mapHtml = `
<div>
  <stable-map items="items">
    <span>{{testData}}</span>
  </stable-map>
</div>`;

const mapHtmlAs = `
<div>
  <stable-map items="items" as="testData">
    <span>{{testData}}</span>
  </stable-map>
</div>`;

const routes = `
<stable-define html="test-component">
  <p>hi</p>
</stable-define>

<div>
  <stable-routes>
    <stable-route html="test-component" />
    <stable-route path="/"  html="test-component" />
    <stable-route path="/test" html="test-component" />
    <stable-route path="/{{path}}" html="test-component" />
  </stable-routes>
</div>`;

module.exports = {
  define,
  ifs,
  mapInclude,
  mapHtml,
  mapHtmlAs,
  routes,
};
