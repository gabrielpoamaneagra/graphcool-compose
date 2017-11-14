const file       = require('./file');
const yaml       = require('node-yaml');
const j          = file.join;
const l          = require('./log');
const assignDeep = require('object-assign-deep');

module.exports = class GraphcoolProject {
    constructor(cwd, program) {
        this.cwd     = cwd;
        this.program = program;

        this.gc      = {};
        this.runtime = {};
        this.yml     = {
            types      : './types.graphql',
            permissions: [],
            rootTokens : [],
            functions  : {}
        };

        this.graphql = "";
    }

    initGraphcoolProject() {
        let rc        = j(this.cwd, '.graphcoolrc');
        let {targets} = file.fileExists(rc) && yaml.readSync(rc);
        if (!targets) {
            throw new Error('.graphcoolrc not found in the current directory');
        }

        if (this.program.target) {
            if (Object.keys(targets).includes(this.program.target)) {
                this.runtime.target = this.program.target
            } else {
                throw new Error('target not found in .graphcoolrc; make sure to deploy it first')
            }
        } else {
            this.runtime.target = targets.default;
        }
    }

    loadEnvironments() {
        let defaultEnv = j(this.cwd, 'environments', 'default.yml');
        let targetEnv  = j(this.cwd, 'environments', `${this.runtime.target}.yml`);
        let readEnv    = (f) => (file.fileExists(f) && yaml.readSync(f)) || {};

        !file.fileExists(defaultEnv) && !file.fileExists(targetEnv)
        && l.notice(`no config file found. searched by ${defaultEnv} or ${targetEnv}`);

        this.gc.env = Object.assign(readEnv(defaultEnv), readEnv(targetEnv));
    }

    loadModules() {
        let modules = file.fileExists(j(this.cwd, 'src')) && file.getDirectories(j(this.cwd, 'src'));
        (!modules || !modules.length) && l.notice('no modules found');

        modules && modules.forEach(this.loadModule.bind(this))
    }

    loadModule(module) {
        let name = file.basename(module);
        l.ok(`${name.toUpperCase()}`);
        this.loadModuleYml(module);
        this.loadModuleResolvers(module);
        this.loadModuleSubscriptions(module);
        this.loadModuleGraphql(module);
    }

    loadModuleYml(module) {
        let name    = file.basename(module);
        let ymlPath = j(module, 'graphcool.yml');
        let yml     = file.fileExists(ymlPath) && yaml.readSync(ymlPath);

        if (yml) {
            (yml.permissions || []).forEach(function(permission) {
                if (permission.query) {
                    permission.query = './' + j('src', name, permission.query);
                }
            });

            assignDeep.withOptions(this.yml, [yml], {
                arrayBehaviour: 'merge'
            });

            l.log(`  [graphcool.yml] ${l.green('ok')}`);
        } else {
            l.log(`  [graphcool.yml] ${l.yellow('not found')}`);
        }
    }

    loadModuleResolvers(module) {
        let name          = file.basename(module);
        let resolverFiles = file.fileExists(j(module, 'resolvers')) && file.getGraphQLFiles(j(module, 'resolvers'));
        let nr            = 0;

        if (resolverFiles && resolverFiles.length) {
            resolverFiles.forEach((resolverFile) => {
                let resolverName     = resolverFile.replace('.graphql', '');
                let resolverFunction = file.fileExists(j(module, "resolvers", resolverName) + ".js") && `${resolverName}.js` ||
                    file.fileExists(j(module, "resolvers", resolverName) + ".ts") && `${resolverName}.ts`;

                this.yml.functions[resolverName] = {
                    type   : "resolver",
                    schema : "./" + j('src', name, "resolvers", resolverFile),
                    handler: {
                        code: {
                            src        : "./" + j('src', name, "resolvers", resolverFunction),
                            environment: Object.assign({}, this.gc.env)
                        }
                    }
                };

                nr++;
            });
            l.log(`  [resolvers] ${l.green('ok')}`);
        } else {
            l.log(`  [resolvers] ${l.yellow('not found')}`);
        }
    }

    loadModuleSubscriptions(module) {
        let name          = file.basename(module);
        let resolverFiles = file.fileExists(j(module, 'subscriptions')) && file.getGraphQLFiles(j(module, 'subscriptions'));
        let nr            = 0;

        if (resolverFiles && resolverFiles.length) {
            resolverFiles.forEach((resolverFile) => {
                let resolverName     = resolverFile.replace('.graphql', '');
                let resolverFunction = file.fileExists(j(module, "subscriptions", resolverName) + ".js") && `${resolverName}.js` ||
                    file.fileExists(j(module, "subscriptions", resolverName) + ".ts") && `${resolverName}.ts`;

                this.yml.functions[resolverName] = {
                    type   : "subscription",
                    query : "./" + j('src', name, "subscriptions", resolverFile),
                    handler: {
                        code: {
                            src        : "./" + j('src', name, "subscriptions", resolverFunction),
                            environment: Object.assign({}, this.gc.env)
                        }
                    }
                };

                nr++;
            });
            l.log(`  [resolvers] ${l.green('ok')}`);
        } else {
            l.log(`  [resolvers] ${l.yellow('not found')}`);
        }
    }

    loadModuleGraphql(module) {
        let name    = file.basename(module);
        let graphql = file.fileExists(j(module, 'types.graphql')) && file.readFileSync(j(module, 'types.graphql'));

        if (graphql) {
            this.graphql += `
###############################################
####### ${name.toUpperCase()} MODULE
###############################################

`;
            this.graphql += graphql;
            this.graphql += `
`;
            l.log(`  [types.graphql] ${l.green('ok')}`);
        } else {
            l.log(`  [types.graphql] ${l.yellow('not found')}`);
        }
    }

    saveFiles() {
        l.log(`\n`);
        yaml.writeSync(j(this.cwd, 'graphcool.yml'), this.yml);
        l.ok(`graphcool.yml saved`);
        file.writeFileSync(j(this.cwd, 'types.graphql'), this.graphql);
        l.ok(`types.graphql saved`);
    }
};