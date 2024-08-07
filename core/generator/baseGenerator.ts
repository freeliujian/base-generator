import { copyFileSync, statSync } from 'fs';
import { dirname } from 'path';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import Generator, { type IGeneratorOpts } from './generator';
import * as until from 'scaffold-tool';

const { constants } = until.default;
const { DEFAULT_END_NAME } = constants;

export interface IBaseGeneratorOpts extends Partial<Omit<IGeneratorOpts, 'args'>> {
  path: string;
  target: string;
  data?: any;
  questions?: inquirer.prompts.PromptCollection[];
}

export default class BaseGenerator extends Generator {
  path: string;
  target: string;
  data: any;
  questions: inquirer.prompts.PromptCollection[];

  constructor({
    path,
    target,
    data,
    questions,
    baseDir,
    slient,
  }: IBaseGeneratorOpts) {
    super({ baseDir: baseDir || target, args: data, slient, templatePath:path });
    this.path = path;
    this.target = target;
    this.data = data;
    this.questions = questions || [];

  }

  prompting() {
    return this.questions;
  }

  async writing() {
    const context = {
      ...this.data,
      ...this.prompts,
    };
    if (statSync(this.path).isDirectory()) {
      this.copyDirectory({
        context,
        path: this.path,
        target: this.target,
      });
    } else {
      if (this.path.endsWith(`${DEFAULT_END_NAME}`)) {
        this.copyTpl({
          templatePath: this.path,
          target: this.target,
          context,
        });
      } else {
        const absTarget = this.target;
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(this.path, absTarget);
      }
    }
  }
}