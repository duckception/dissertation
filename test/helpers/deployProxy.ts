import { Wallet } from 'ethers'
import { TransparentUpgradeableProxy as Proxy, TransparentUpgradeableProxy__factory } from '../../build'

export async function deployProxy(
  deployer: Wallet,
  implementationAddress: string,
  adminAddress: string,
  data: string | Buffer = Buffer.from(''),
): Promise<Proxy> {
  const factory = new TransparentUpgradeableProxy__factory(deployer)
  const proxy = await factory.deploy(implementationAddress, adminAddress, data)
  return proxy.deployed()
}
