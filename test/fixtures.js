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

const map = `
<div>
  <stable-map data="items">
    <p>item</p>
  </stable-map>
</div>`;

module.exports = {
  define,
  ifs,
  map,
};
