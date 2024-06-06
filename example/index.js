const { BaseGenerator } = require("../dist/cjs/index").default;

const option = {
  // path: "./example/tem",
  // target: "./example/target/path",
  data: {},
  questions: [
    {
      type: "number",
      name: "name",
      message: "请为你的项目命名",
    },
  ],
};

const baseG = new BaseGenerator(option);

const fn = {
  name: "includes",
  fn: (context, item) => {
    console.log(context)
    if (context === '123') {
      return context;
    } else {
      return '你的名字不是123'
    }
  },
};

baseG.helper(fn);
baseG.run();
 