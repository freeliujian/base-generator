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

## 使用Helper

``` js
const baseG = new BaseGenerator(option);
const fn = {
  name: 'aps',
  fn: (aString) => {
    return 'aps'.toUpperCase()
  }
}

baseG.helper(fn);
baseG.run();

```
将注册一个`aps`的方法，在handlebars，同`registerHelper`。