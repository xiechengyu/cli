#!/usr/bin/env node

const shell = require('shelljs');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk')
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const spinner = ora();

program
  .version('1.0.0', '-v, --version')
  .command('init <dir>')
  .action(function (dir) {
    console.log('dir')
  })
program.parse(process.argv);

let dir = program.args[0];

const questions = [{
    type: 'input',
    name: 'name',
    message: '请输入项目名称',
    default: 'demo-static',
    validate: (name)=>{
        if(/^[a-z]+/.test(name)){
            return true;
        }else{
            return '项目名称必须以小写字母开头';
        }
    }
}]

inquirer.prompt(questions).then((answers)=>{
    // 初始化模板文件
    downloadTemplate(answers);
})

function downloadTemplate(params){
    spinner.start('loading');
    let isHasDir = fs.existsSync(path.resolve(dir));
    if(isHasDir){
        spinner.fail('当前目录已存在!');
        return false;
    }
    // 开始下载模板文件
    download('github:xiechengyu/omi', dir, {clone: true}, function(err){
        if(err){
            spinner.fail(err);
            console.log(chalk.blue('第一个错误'));
        };
        updateTemplateFile(params);
    })
}

function updateTemplateFile(params){
    let { name, description } = params;
    fs.readFile(`${path.resolve(dir)}/my-app/package.json`, (err, buffer)=>{
        if(err) {
            console.log(chalk.red(err));
            console.log(chalk.blue('第二个错误'));
            return false;
        }
        shell.rm('-f', `${path.resolve(dir)}/.git`);
        shell.rm('-f', `${path.resolve(dir)}/my-app/CHANGELOG.md`);
        let packageJson = JSON.parse(buffer);
        Object.assign(packageJson, params);
        fs.writeFileSync(`${path.resolve(dir)}/my-app/package.json`, JSON.stringify(packageJson, null, 2));
        fs.writeFileSync(`${path.resolve(dir)}/my-app/README.md`, `# ${name}\n> ${description}`);
        spinner.succeed('创建完毕');
    });
}