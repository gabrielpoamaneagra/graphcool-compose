# graphcool-compose
Command line tool that composes the graphcool.yml and types.graphql following a predefined folder structure. Allows you to structure your project into modules, each with its own `resolvers`, `permission` queries, `graphcool.yml` file and `types.graphql` file
### Installation
```sh
$ npm install -g graphcool-compose
```
or
```sh
$ yarn global add graphcool-compose
```

### Usage
##### build for default target
```sh
$ graphcool-compose
```
##### build for specific target
```sh
$ graphcool-compose --target qa
```

##### build and call graphcool deploy
```sh
$ graphcool-compose --target qa --deploy
```
##### build and call graphcool deploy --force
```sh
$ graphcool-compose --target qa --deploy --force
```

### Prerequisites
A valid graphcool project is assumed (folder with a `.graphcoolrc`)

### File Structure
##### see [example](https://github.com/gabriel-poamaneagra/graphcool-compose/tree/master/file-structure-example) here
`graphcool-compose` assumes a specific folder structure
```
|-- environemnts
    |-- default.yml
    |-- target1.yml
    |-- target2.yml
    ...
|-- src
    |-- module1
        |-- resolvers
            |-- resolver1.graphql
            |-- resolver1.ts
            |-- resolver2.graphql
            |-- resolver2.js
        |-- permissions
            |-- type1.graphql
            |-- type2.graphql
        |-- graphcool.yml
        |-- types.graphql
    |-- module2
        |-- types.graphql
|-- .graphcoolrc
```

#### File Structure Details

| folder | details |
| ------ | ------ |
| environemnts | environment vars will be set for every resolver. default.yml will be merged with the target specific file |
| src/moduleX | every module will have it's own folder in the src |
| src/moduleX/resolvers | the resolver files - a resolverName.graphql + resolverName.ts (or.js) pair |
| src/moduleX/permissions | the graphql files that hold the permission queries |
| src/moduleX/graphcool.yml | basically permissions, just like in the graphcool.yml; **note that the query paths are relative, will be resolved by graphcool-compose** |
| src/moduleX/types.graphql | these files will just be merged in the root/types.graphql file |
