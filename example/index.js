const { BaseGenerator } = require("../dist/cjs/index").default;

const option = {
  path: "./example/templates",
  target: "./example/target/path",
  data: {},
  questions: [
    {
      type: "number",
      name: "name",
      message: "请为你的项目命名",
    },
    // {
    //   type: 'multiselect',
    //   name: 'sex',
    //   message: '选择你的性别',
    //   default: ["liujian"],
    //   choices: [
    //     { name: 'liujian', value: 'liujian' },
    //   ]
    // },
  ],
};

const baseG = new BaseGenerator(option);

const fn = {
  name: "includes",
  fn: (context, item, options) => {
    if (context) {
      if (context.includes(item)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    } else {
      return " ";
    }
  },
};

baseG.helper(fn);
baseG.run();
 