import { copyFileSync, statSync } from 'fs';
import { dirname } from 'path';
import fsExtra from 'fs-extra';
import prompts from 'prompts';
import Generator, { type IGeneratorOpts } from './generator';

export interface IBaseGeneratorOpts extends Partial<Omit<IGeneratorOpts, 'args'>> {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}

export default class BaseGenerator extends Generator {
  path: string;
  target: string;
  data: any;
  questions: prompts.PromptObject[];

  constructor({
    path,
    target,
    data,
    questions,
    baseDir,
    slient,
  }: IBaseGeneratorOpts) {
    super({ baseDir: baseDir || target, args: data, slient, templatePath: process.cwd() });
    this.path = path || this.templatePath();
    this.target = target;
    this.data = data || {};
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
    console.log(this.path);
    if (statSync(this.path).isDirectory()) {
      this.copyDirectory({
        context,
        path: this.path,
        target: this.target,
      });
    } else {
      if (this.path.endsWith('.sa')) {
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
