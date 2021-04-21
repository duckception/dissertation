import { constants, Wallet } from 'ethers'
import { DuckExpress__factory } from '../../build'
import { deployProxy } from './deployProxy'
import { deployDuckExpress } from './deployDuckExpress'
import { randomAddress } from './randomAddress'

const INITIAL_MIN_EXPIRATION_TIME = 12 * 3600

export async function deployDuckExpressBehindProxy(deployer: Wallet) {
  const DuckExpress = await deployDuckExpress(deployer, constants.AddressZero)
  const initializeCall = DuckExpress.interface.encodeFunctionData('initialize', [
    deployer.address,
    INITIAL_MIN_EXPIRATION_TIME,
  ])
  const proxy = await deployProxy(deployer, DuckExpress.address, randomAddress(), initializeCall)
  return DuckExpress__factory.connect(proxy.address, deployer)
}
