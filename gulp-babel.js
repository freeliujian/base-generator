import path from 'path';
import PluginError from 'plugin-error';
import { obj as through } from 'through2';
import applySourceMap from 'vinyl-sourcemaps-apply';
import replaceExt from 'replace-ext';
import babel from '@babel/core';

function replaceExtension(fp) {
	return path.extname(fp) ? replaceExt(fp, '.js') : fp;
}

export default function (opts) {
	opts = opts || {};

	return through(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new PluginError('gulp-babel', '不支持流操作'));
			return;
		}

		if (!supportsCallerOption()) {
			cb(new PluginError('gulp-babel', '需要@babel/core@^7.0.0以上版本'));
			return;
		}

		const fileOpts = Object.assign({}, opts, {
			filename: file.path,
			filenameRelative: file.relative,
			sourceMap: Boolean(file.sourceMap),
			sourceFileName: file.relative,
			caller: Object.assign(
				{name: 'babel-gulp'},
				opts.caller
			)
		});

		babel.transformAsync(file.contents.toString(), fileOpts).then(res => {
			if (res) {
				if (file.sourceMap && res.map) {
					res.map.file = replaceExtension(file.relative);
					applySourceMap(file, res.map);
				}

				file.contents = Buffer.from(res.code);
				file.path = replaceExtension(file.path);

				file.babel = res.metadata;
			}

			this.push(file);
		}).catch(error => {
			this.emit('error', new PluginError('gulp-babel', error, {
				fileName: file.path,
				showProperties: false
			}));
		}).then(
			() => cb(),
			() => cb()
		);
	});
};

// 注意：我们最终可以删除这部分代码，我只是为了让人们有一些时间来迁移到更新的@babel/core版本，而不会因为未知的'caller'选项错误而感到困惑。
let supportsCallerOptionFlag;
function supportsCallerOption() {
	if (supportsCallerOptionFlag === undefined) {
		try {
			// 与其尝试匹配Babel版本，不如直接检查是否在传递'caller'标志时会抛出错误，并以此来确定其是否被支持。
			babel.loadPartialConfig({
				caller: undefined,
				babelrc: false,
				configFile: false
			});
			supportsCallerOptionFlag = true;
		} catch (_) {
			supportsCallerOptionFlag = false;
		}
	}

	return supportsCallerOptionFlag;
}