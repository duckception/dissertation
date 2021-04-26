# 🧙‍♂️ DuckExpress

## ⚙️ Installation

In order to install this project, you need to have `yarn` and `node` already installed on your machine.

First of all, you need to install all necessary dependencies by running:
```shell
yarn
```

## 🏗 Compilation

To compile the project you need to run the following command:
```shell
yarn build
```

Once the contract are compiled you can run the test suite by running:
```shell
yarn test
```

No additional configuration is required. All compilation products will be placed in `/build` directory.

## ✅ Checks

There are two checks that can be run on this codebase.

First and most important one is already mentioned test suite, which can run by using `yarn test` command. Additionally you can check tests' type safety by running this command:
```shell
yarn typecheck
```
You can also check code's linting by running this command:
```shell
yarn lint
```
It checks code of both tests and smart contracts.
