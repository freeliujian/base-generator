# Desc

一个基于 prompts 和 handlebars 的创建模板的 node脚本 （基于umi的源码创）

## 如何使用

根据后缀识别模板，后缀为tpl

```js

const {BaseGenerator} = require('../dist/cjs/index').default;

const option = {
  path: './example/tem',
  target: './example/target/path',
  data: {},
  questions: [
    {
      type: 'number',
      name: "name",
      message: '请为你的项目命名',
    },
  ],
}

const baseG = new BaseGenerator(option);

baseG.run();

```

## 后续
1. 支持handlebars 的一些API， `setHelpers`等...
