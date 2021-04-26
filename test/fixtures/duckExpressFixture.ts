import { Wallet } from 'ethers'
import { MockProvider } from 'ethereum-waffle'
import { deployDuckExpressBehindProxy } from '../helpers/deployDuckExpressBehindProxy'
import { asWalletFactory } from '../helpers/asWalletFactory'
import { erc20TokenFixture } from './erc20TokenFixture'

export async function duckExpressFixture(wallets: Wallet[], provider: MockProvider) {
  const [deployer, customer, courier, addressee] = wallets
  const { token } = await erc20TokenFixture([customer, courier])
  const duckExpress = await deployDuckExpressBehindProxy(deployer)

  return {
    provider,
    deployer,
    customer,
    courier,
    addressee,
    duckExpress,
    token,
    asCustomer: asWalletFactory(customer),
    asCourier: asWalletFactory(courier),
    asAddressee: asWalletFactory(addressee),
  }
}
