module.exports = function (api) {
  api.cache(true);

  const presets = {
    cjs: ["@babel/preset-env", { modules: "commonjs" }],
    esm: ["@babel/preset-env", { modules: false }],
  };

  return {
    presets: [
      presets[process.env.BABEL_ENV],
      "@babel/preset-typescript",
      "@babel/preset-flow",
    ],
  };
};
