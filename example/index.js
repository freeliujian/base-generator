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