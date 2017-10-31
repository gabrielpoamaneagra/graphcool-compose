const chalk = require('chalk');
module.exports = {
    log: (m) => console.log(m),
    err: (m) => console.log(chalk.red(m)),
    notice: (m) => console.log(chalk.yellow(m)),
    ok: (m) => console.log(chalk.green(m)),
    green: (s) => chalk.green(s),
    yellow: (s) => chalk.yellow(s)
};