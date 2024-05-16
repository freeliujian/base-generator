const { series, src, dest, watch, parallel } = require("gulp");
const ts = require("gulp-typescript");
const babel = require("gulp-babel");
const gulpIf = require("gulp-if");
const through2 = require("through2");

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
const JSFileExtensionRegex = /\.js$/;

const tsProject = ts.createProject("./tsconfig.json", { declaration: true });

const compileScript = (babelConfig, destDir, BABEL_ENV = "cjs") => {
  process.env.BABEL_ENV = BABEL_ENV;
  return src(paths.scripts).pipe(babel(babelConfig)).pipe(dest(destDir));
};

// const buildESM = () => {
//   // return src(paths.scripts)
//   //   .pipe(tsProject())
//   //   .pipe(
//   //     gulpIf(
//   //       (file) => TSFileExtensionRegex.test(file.path),
//   //       dest(paths.dest.types)
//   //     )
//   //   )
//   //   .pipe(
//   //     gulpIf(
//   //       (file) => JSFileExtensionRegex.test(file.path),
//   //       dest(paths.dest.esm)
//   //     )
//   //   );
//   return compileScript('esm', paths.dest.esm);
// };

// const buildCJS = () => {
//   return compileScript("cjs", paths.dest.cjs);
// };

// // const buildTypes = () => {
// //   return src(paths.scripts)
// //     .pipe(tsProject())
// //     .pipe(
// //       through2.obj(function(file, encoding, next) {
// //         if (TSFileExtensionRegex.test(file.path)) {
// //           this.push(file);
// //         }
// //         next();
// //     })
// //   )
// //   .pipe(dest(paths.dest.types))
// // }


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

const buildCJS = () => {
  const babelConfig = {
    presets: [
      ["@babel/preset-env", { modules: "commonjs" }],
      "@babel/preset-typescript",
      "@babel/preset-flow",
    ],
  };
  return compileScript(babelConfig, paths.dest.cjs);
};

const buildTypes = () => {
  return src(paths.scripts)
    .pipe(tsProject())
    .pipe(
      through2.obj(function(file, encoding, next) {
        if (TSFileExtensionRegex.test(file.path)) {
          this.push(file);
        }
        next();
    })
  )
  .pipe(dest(paths.dest.types))
}

const buildScript = series(buildESM, buildCJS, buildTypes);

const watchFiles = () => {
  return watch(paths.scripts, buildScript);
};

exports.default = buildScript;
