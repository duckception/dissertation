import { Wallet } from 'ethers'
import { DuckExpress, DuckExpress__factory, TransparentUpgradeableProxy as Proxy, TransparentUpgradeableProxy__factory } from '../build'
import { DeploymentConfig } from './models/DeploymentConfiguration'
import { waitForTx } from './utils/waitForTx'

export async function deployDuckExpressContracts(
  deployer: Wallet,
  config: DeploymentConfig,
) {
  console.log('Starting deployment of Duck Express contracts:')

  const [duckExpressProxy, duckExpressProxyAddress, duckExpressImplAddress] = await deployDuckExpressBehindProxy(
    deployer,
    config.implContractsOwner,
    config.duckExpressProxyAdmin,
    config.duckExpressConfig.minDeliveryTime,
  )

  await supportTokens(duckExpressProxy, config.duckExpressConfig.supportedTokens)

  await duckExpressProxy.transferOwnership(config.duckExpressOwner)

  return {
    duckExpressProxyAddress,
    duckExpressImplAddress,
  }
}

async function supportTokens(duckExpress: DuckExpress, tokens: string[]) {
  for (const token of tokens) {
    const tx = duckExpress.supportToken(
      token,
      { gasLimit: 400_000 },
    )
    await waitForTx(tx)
    console.log(`  Token supported: ${token}`)
  }
}

async function deployProxy(
  deployer: Wallet,
  implementationAddress: string,
  adminAddress: string,
  data: string | Buffer = Buffer.from(''),
): Promise<Proxy> {
  const factory = new TransparentUpgradeableProxy__factory(deployer)
  const proxy = await factory.deploy(implementationAddress, adminAddress, data)
  return proxy.deployed()
}

async function deployDuckExpress(deployer: Wallet, owner: string): Promise<DuckExpress> {
  const factory = new DuckExpress__factory(deployer)
  const duckExpress = await factory.deploy(owner)
  await duckExpress.deployed()

  console.log(`Duck Express implementation contract deployed at ${duckExpress.address}`)

  return duckExpress
}

async function deployDuckExpressBehindProxy(
  deployer: Wallet,
  implContractOwner: string,
  proxyAdminAddress: string,
  minDeliveryTime: number,
): Promise<[DuckExpress, string, string]> {
  const duckExpress = await deployDuckExpress(deployer, implContractOwner)
  const initializeCall = duckExpress.interface.encodeFunctionData('initialize', [deployer.address, minDeliveryTime])
  const proxy = await deployProxy(deployer, duckExpress.address, proxyAdminAddress, initializeCall)

  console.log(`Duck Express proxy contract deployed at ${proxy.address}`)

  return [DuckExpress__factory.connect(proxy.address, deployer), proxy.address, duckExpress.address]
}
