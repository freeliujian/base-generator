module.exports = function (api) {
  api.cache(true);

  const presets = {
    cjs: ["@babel/preset-env", { modules: "commonjs" }],
    esm: ["@babel/preset-env", { modules: false }],
  };

  console.log(presets[process.env.BABEL_ENV], process.env.BABEL_ENV);
  
  return {
    presets: [
      presets[process.env.BABEL_ENV],
      "@babel/preset-typescript",
      "@babel/preset-flow",
    ],
  };
};
