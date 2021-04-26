# 🧙‍♂️ Duck Express

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

## 🚀 Deployment

The deployment of the Duck Express system is done in the following way. First the implementation of the `DuckExpress` contract is deployed. Then the OpenZeppelin's proxy is deployed. Afterwards, the script calls `supportToken` method for all tokens from the deployment configuration. In the final step, the script calls `transferOwnership` method and transfers it to a proxy admin specified in the deployment configuration.

## 📡 Deployment on Rinkeby testnet

The results of testnet deployment on 26th April 2021:
```
Starting deployment of Duck Express contracts:
DuckExpress implementation deployed at 0x2A9eb800F27818056Aff9551aa129D583d190fe9
DuckExpress proxy deployed at 0x653564F26c7005bbAdaD09EA46ACb9Dec914821E
  Token supported: 0x3e2ee9685b71879cdd1fc1d8c890a0d8c925f80a
```
