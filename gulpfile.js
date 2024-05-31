const { series, src, dest, watch } = require("gulp");
const GulpTypescript = require("gulp-typescript");
const babel = require("gulp-babel");
const { obj } = require("through2");

const { createProject } = GulpTypescript;

const paths = {
  dest: {
    types: "dist/types",
    cjs: "dist/cjs",
    esm: "dist/esm",
    dist: "dist",
  },
  scripts: ["./core/**/*.ts"],
};

const TSFileExtensionRegex = /\.d?\.ts$/;

const tsProject = createProject("./tsconfig.json", { declaration: true });

const compileScript = (babelConfig, destDir, BABEL_ENV = "cjs") => {
  process.env.BABEL_ENV = BABEL_ENV;
  return src(paths.scripts).pipe(babel(babelConfig)).pipe(dest(destDir));
};


const buildESM = () => {
  const babelConfig = {
    presets: [
      ["@babel/preset-env", { modules: false }],
      "@babel/preset-typescript",
      "@babel/preset-flow",
    ],
  };
  return compileScript(babelConfig, paths.dest.esm);
};

const buildCJS = (cd) => {
  const babelConfig = {
    presets: [
      ["@babel/preset-env", { modules: "commonjs" }],
      "@babel/preset-typescript",
      "@babel/preset-flow",
    ],
    plugins: [
      "@babel/plugin-transform-modules-commonjs",
    ]
  }; 
  return compileScript(babelConfig, paths.dest.cjs);
  // cd();
};

const buildTypes = () => {
  return src(paths.scripts)
    .pipe(tsProject())
    .pipe(
      obj(function(file, encoding, next) {
        if (TSFileExtensionRegex.test(file.path)) {
          this.push(file);
        }
        next();
    })
  )
  .pipe(dest(paths.dest.types))
}

const buildScript = series(buildCJS, buildTypes);

const watchFiles = () => {
  return watch(paths.scripts, buildScript);
};

exports.default = watchFiles;
