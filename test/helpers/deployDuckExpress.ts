import { Wallet } from 'ethers'
import { DuckExpress, DuckExpress__factory } from '../../build'

export async function deployDuckExpress(deployer: Wallet, owner: string): Promise<DuckExpress> {
  const factory = new DuckExpress__factory(deployer)
  const DuckExpress = await factory.deploy(owner)
  await DuckExpress.deployed()
  return DuckExpress
}
