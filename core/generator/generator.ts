import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import chalk from 'chalk';
import fsExtra from 'fs-extra';
import {globSync} from 'glob';
import prompts from 'prompts';
import yParser from 'yargs-parser';
import Handlebars from 'handlebars';

export interface IGeneratorOpts {
  baseDir: string;
  args: yParser.Arguments;
  slient?: boolean;
}

interface IGeneratorBaseOpts {
  context: Record<string, any>;
  target: string;
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

class Generator {
  baseDir: string;
  args: yParser.Arguments;
  slient: boolean;
  prompts: any;

  constructor({ baseDir, args, slient }: IGeneratorOpts) {
    this.baseDir = baseDir;
    this.args = args;
    this.slient = !!slient;

    this.prompts = {};
  }

  async run() {
    const questions = this.prompting();
    this.prompts = await prompts(questions, {
      onCancel() {
        process.exit(1);
      },
    });
    await this.writing();
  }

  prompting() {
    return [] as any;
  }

  async writing() { }
  
  helper(helpers: helpers) {
    const {name ,fn} = helpers
    Handlebars.registerHelper(name, fn);
  }

  copyTpl(opts: IGeneratorCopyTplOpts) {
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Handlebars.compile(tpl);
    const configContent = content(opts.context)
    fsExtra.mkdirpSync(dirname(opts.target));
    if (!this.slient) {
      console.log(
        `${chalk.green('Write:')} ${relative(this.baseDir, opts.target)}`,
      );
    }
    writeFileSync(opts.target, configContent, 'utf-8');
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
      if (file.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: absFile,
          target: join(opts.target, file.replace(/\.tpl$/, '')),
          context: opts.context,
        });
      } else {
        if (!this.slient) {
          console.log(`${chalk.green('Copy: ')} ${file}`);
        }
        const absTarget = join(opts.target, file);
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;