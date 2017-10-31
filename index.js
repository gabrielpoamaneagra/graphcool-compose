#!/usr/bin/env node
const program = require('commander');
const chalk   = require('chalk');
const GC      = require('./lib/graphcool-project');
let gc        = null;

program
    .version(require('./package.json').version)
    .option('-t, --target [value]', 'Local target, ID or alias of service to deploy')
    .option('-d, --deploy', 'Also call graphcool deploy')
    .option('-f, --force', 'Also call graphcool deploy --force');


program.on('--help', function() {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('   To build the default target');
    console.log(chalk.green('   $ graphcool-compose'));
    console.log('');
    console.log('   To build dev target');
    console.log(chalk.green('   $ graphcool-compose --target dev'));
    console.log('');
    console.log('   To build and deploy dev target');
    console.log(chalk.green('   $ graphcool-compose --target dev --deploy'));
    console.log('');
    console.log('   To build and deploy default target with the --force option');
    console.log(chalk.green('   $ graphcool-compose --target dev --deploy --force'));
    console.log('');
});


program.parse(process.argv);

gc = new GC(process.cwd(), program);

try {
    gc.initGraphcoolProject();
    gc.loadEnvironments();
    gc.loadModules();
    gc.saveFiles();
} catch (e) {
    console.log(chalk.red(e.message));

    throw e;
}

program.deploy && callGraphCool(program.force);


function callGraphCool(force) {
    let args = ['deploy', '--target', gc.runtime.target];
    force && args.push('--force');

    console.log('');
    console.log(chalk.green(`graphcool ${args.join(' ')}`));
    console.log('');

    const graphcool = require('child_process').spawn('graphcool', args, {
        env: process.env,
        stdio: ['pipe', process.stdout, process.stderr]
    });
}