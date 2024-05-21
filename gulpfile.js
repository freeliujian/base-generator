import { series, src, dest, watch, parallel } from "gulp";
import  GulpTypescript from "gulp-typescript";
import babel from "./gulp-babel.js";
import { obj } from "through2";

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
const JSFileExtensionRegex = /\.js$/;

const tsProject = createProject("./tsconfig.json", { declaration: true });

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

const buildCJS = (cd) => {
  // const babelConfig = {
  //   presets: [
  //     ["@babel/preset-env", { modules: "commonjs" }],
  //     "@babel/preset-typescript",
  //     "@babel/preset-flow",
  //   ],
  //   plugins: [
  //     "@babel/plugin-transform-modules-commonjs",
  //   ]
  // };
  // return compileScript(babelConfig, paths.dest.cjs);
  cd();
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

const buildScript = series(buildESM, buildCJS, buildTypes);

const watchFiles = () => {
  return watch(paths.scripts, buildScript);
};

const _default = watchFiles;
export { _default as default };
