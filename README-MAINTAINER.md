[![GitHub package.json version](https://img.shields.io/github/package-json/v/xpack/tsdoc2docusaurus-cli-ts)](https://github.com/xpack/tsdoc2docusaurus-cli-ts/blob/master/package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@xpack/tsdoc2docusaurus-cli.svg)](https://www.npmjs.com/package/@xpack/tsdoc2docusaurus-cli/)
[![license](https://img.shields.io/github/license/xpack/tsdoc2docusaurus-cli-ts.svg)](https://github.com/xpack/tsdoc2docusaurus-cli-ts/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/xpack/tsdoc2docusaurus-cli-ts.svg)](https://github.com/xpack/tsdoc2docusaurus-cli-ts/issues)
[![GitHub pulls](https://img.shields.io/github/issues-pr/xpack/tsdoc2docusaurus-cli-ts.svg)](https://github.com/xpack/tsdoc2docusaurus-cli-ts/pulls/)

# Maintainer & developer info

## Project repository

The project is hosted on GitHub:

- <https://github.com/xpack/tsdoc2docusaurus-cli-ts.git>

The project uses two branches:

- `master`, with the latest stable version (default)
- `development`, with the current development version

To clone the `master` branch, use:

```sh
mkdir ${HOME}/Work/npm-packages && cd ${HOME}/Work/npm-packages
git clone \
https://github.com/xpack/tsdoc2docusaurus-cli-ts.git tsdoc2docusaurus-cli-ts.git
```

For development, to clone the `development` branch, use:

```sh
git clone --branch development \
https://github.com/xpack/tsdoc2docusaurus-cli-ts.git tsdoc2docusaurus-cli-ts.git
```

## Prerequisites

The prerequisites are:

- node >= 20.0.0
- npm

To ensure compatibility with older node, revert to an older one:

```sh
nvm use --lts 20
code
```

## Satisfy dependencies

```sh
npm install
```

## Add links for development

```sh
cd tsdoc2docusaurus-cli-ts.git
npm link
```

And in the projects referring it:

```sh
npm link @xpack/tsdoc2docusaurus-cli
```

## Start the compile background task

The TypeScript compiler can automatically recompile modified files. For
this, start it in `watch` mode.

```sh
npm run compile-watch
```

## Language standard compliance

The current version is TypeScript 4:

- <https://www.typescriptlang.org>
- <https://www.typescriptlang.org/docs/handbook>

The compiler is configured to produce `es2020` files,
which means ECMAScript6 that can be imported
by any other project via `import`.

For more details on how to configure `tsconfig.json`, please see:

- <https://www.typescriptlang.org/tsconfig/>

## Standard style

As style, the project uses `typescript-eslint`, the TypeScript variant of
ESlint.

```js
// eslint-disable-next-line @typescript-eslint/no-xxx-yyy
```

The known rules are documented in the
[typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/docs/rules)
project.

Known and accepted exceptions:

- none

To manually fix compliance with the style guide (where possible):

```console
% npm run fix

> @xpack/tsdoc2docusaurus-cli@1.3.2 fix
> ts-standard --fix src && standard --fix test
...
```

## Documentation metadata

The documentation metadata uses the
[TSDoc](https://tsdoc.org) tags, without
explicit types, since they are provided by TypeScript.

## Tests

TBD

### Continuous Integration (CI)

The continuous integration tests are performed via GitHub
[Actions](https://github.com/xpack/tsdoc2docusaurus-cli-ts/actions) on 
multiple platforms, with multiple node versions.

TBD

## How to make new releases

### Release schedule

There are no fixed releases.

### Check Git

In the `xpack/tsdoc2docusaurus-cli-ts` Git repo:

- switch to the `development` branch
- if needed, merge the `master` branch

No need to add a tag here, it'll be added when the release is created.

### Update npm packages

Notice: this package is also used by the VS Code extension and must be
kept as a legacy CommonJS dependency.

- `npm outdated`
- `npm update` or edit and `npm install`
- repeat and possibly manually edit `package.json` until everything is
  up to date
- commit the changes

### Determine the next version

As required by npm modules, this one also uses [semver](https://semver.org).

Determine the next version (like `1.3.2`),
and eventually update the
`package.json` file; the format is `1.3.2-pre`.

### Fix possible open issues

Check GitHub issues and pull requests:

- <https://github.com/xpack/tsdoc2docusaurus-cli-ts/issues/>

### Update `README-MAINTAINER.md`

Update the `README-MAINTAINER.md` file to reflect the changes
related to the new version.

## Update `CHANGELOG.md`

- check the latest commits `npm run git-log`
- open the `CHANGELOG.md` file
- check if all previous fixed issues are in
- add a line _* v1.3.2 released_
- commit with a message like _prepare v1.3.2_

## Prepare to publish

- terminate all running tasks (**Terminal** → **Terminate Task...**)
- select the `development` branch
- commit everything
- `npm run fix-compile`
- in the development branch, commit all changes
- `npm run test`
- `npm run pack`; check the list of packaged files, possibly
  update `.npmignore`
- `npm version patch` (bug fixes), `npm version minor` (compatible API
  additions), `npm version major` (incompatible API changes)
- push all changes to GitHub;
- the `postversion` npm script should also update tags via
  `git push origin --tags`; this should trigger CI
- **wait for CI tests to complete**
- check <https://github.com/xpack/tsdoc2docusaurus-cli-ts/actions/>

## Publish to npmjs.com

- `npm publish --tag test` (use `--access public` when publishing for the first time)

Check if the version is present at
[@xpack/tsdoc2docusaurus-cli Versions](https://www.npmjs.com/package/@xpack/tsdoc2docusaurus-cli?activeTab=versions).

### Test

Test it with:

```bash
npm install -global @xpack/tsdoc2docusaurus-cli@test
```

### Merge into `master`

In this Git repo:

- select the `master` branch
- merge `development`
- push all branches

### Close milestone

In <https://github.com/xpack/tsdoc2docusaurus-cli-ts/milestones>:

- close the current milestone.

## Web site deployment

The documentation site is built with [TypeDoc](https://typedoc.org/) and
published in the project GitHub
[Pages](https://xpack.github.io/tsdoc2docusaurus-cli-ts/).

The Web site deployment is performed automatically when pushing to the
master branch, by a dedicated workflow in GitHub
[Actions](https://github.com/xpack/tsdoc2docusaurus-cli-ts/actions/workflows/typedoc.yml).

### Tag the npm package as `latest`

When the release is considered stable, promote it as `latest`:

- `npm dist-tag ls @xpack/tsdoc2docusaurus-cli`
- `npm dist-tag add @xpack/tsdoc2docusaurus-cli@1.3.2 latest`
- `npm dist-tag ls @xpack/tsdoc2docusaurus-cli`

## Useful links

- <https://www.typescriptlang.org/docs/>
- <https://www.typescriptlang.org/tsconfig/>
- <https://typedoc.org>, <https://typedoc.org/guides/doccomments/>
- <https://tsdoc.org>
- <https://jsdoc.app/index.html>
- <https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1>
