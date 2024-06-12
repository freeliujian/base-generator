import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import chalk from 'chalk';
import fsExtra from 'fs-extra';
import {globSync} from 'glob';
import prompts from 'prompts';
import yParser from 'yargs-parser';
import Handlebars from 'handlebars';
import path from 'node:path';
import debug from 'debug';


export interface IGeneratorOpts {
  baseDir: string;
  args: yParser.Arguments;
  slient?: boolean;
  
}

interface IGeneratorBaseOpts {
  context: Record<string, any>;
  target?: string;
}

interface IGeneratorCopyTplOpts extends IGeneratorBaseOpts {
  templatePath: string;
}

interface IGeneratorCopyDirectoryOpts extends IGeneratorBaseOpts {
  path: string;
}

interface helpers {
  name: string;
  fn: Handlebars.HelperDelegate;
}

debug('fsExtra');

class Generator {
  baseDir: string;
  args: yParser.Arguments;
  slient: boolean;
  prompts: any;
  private _destinationRoot: string;
  _templatePath: any;

  constructor({ baseDir, args, slient }: IGeneratorOpts) {
    this.args = args;
    this.slient = !!slient;
    this._destinationRoot = '';
    this.prompts = {};
    this.baseDir = baseDir;
  }

  async run() {
    const questions = this.prompting();
    this.prompts = await prompts(questions, {
      onCancel() {
        process.exit(1);
      },
    });
    await this.writing();
    await this.afterWriting();
    await this.end();
  }

  prompting() {
    return [] as any;
  }

  sourceRoot() {
    return path.join(__dirname, 'templates');
  }

  templatePath(...paths: any[]) {
    return path.join(this._templatePath, ...paths);
  }

  destinationRoot(rootPath?: string) {
    if (rootPath) {
      this._destinationRoot = path.resolve(rootPath);
    }
    return this._destinationRoot || process.cwd();
  }

  async writing() { }

  async afterWriting() { }

  async end() { }
  
  async helper(helpers: helpers) {
    if (helpers) {
      const { name, fn } = helpers
      console.log(2);
      Handlebars.registerHelper(name, fn);
    }
   }

  copyTpl(opts: IGeneratorCopyTplOpts) { 
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Handlebars.compile(tpl);
    const configContent = content(opts.context)
    fsExtra.mkdirpSync(dirname(opts.target || this.destinationRoot()));
    if (!this.slient) {
      console.log(
        `${chalk.green('Write:')} ${relative(this.baseDir, opts.target || this.destinationRoot())}`,
      );
    }
    writeFileSync(opts.target || this.destinationRoot(), configContent, 'utf-8');
  }

  copyDirectory(opts: IGeneratorCopyDirectoryOpts) {
    const files = globSync('**/*', {
      cwd: opts.path,
      dot: true,
      ignore: ['**/node_modules/**'],
    });
    files.forEach((file: any) => {
      const absFile = join(opts.path, file);
      if (statSync(absFile).isDirectory()) return;
      if (file.endsWith('.sa')) {
        console.log(2);
        this.copyTpl({
          templatePath: absFile,
          target: join(opts.target || this.destinationRoot(), file.replace(/\.sa$/, '')),
          context: opts.context,
        });
      } else {
        if (!this.slient) {
          console.log(`${chalk.green('Copy: ')} ${file}`);
        }
        const absTarget = join(opts.target || this.destinationRoot(), file);
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;