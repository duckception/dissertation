import { BigNumber, providers, utils, Wallet } from 'ethers'
import { createDeploymentConfig } from '../src/deploymentConfig'
import { deployDuckExpressContracts } from '../src/deployDuckExpressContracts'
import { DuckExpress__factory } from '../build'
import { erc20TokenFixture } from '../test/fixtures/erc20TokenFixture'
import { asWalletFactory } from '../test/helpers/asWalletFactory'
import { waitForTx } from '../src/utils/waitForTx'

const DEPLOYER_PRIVATE_KEY = '9fdff6a2119765bf328dbd597a894059165dc7d5aa7ca5c2f5face20916ddd5c' as const
const GAS_LIMIT = 4_000_000

void (async () => {
  const provider = new providers.JsonRpcProvider()
  const deployer = new Wallet(DEPLOYER_PRIVATE_KEY, provider)

  console.log('\n------------PREPARATION------------')

  console.log('Generating wallets...')
  const wallets = generateWallets(provider)
  const [customer, courier, addressee] = wallets
  await populateWalletsWithEther(deployer, wallets, utils.parseEther('1000'))

  console.log('Starting deployment of dummy ERC-20 token:')
  const { token } = await erc20TokenFixture([customer, courier])
  console.log(`Token deployed at ${token.address}`)

  const config = createDeploymentConfig()
  config.duckExpressConfig.supportedTokens = [
    token.address,
  ]
  const [duckExpressAddress] = await deployDuckExpressContracts(deployer, config)

  const duckExpress = DuckExpress__factory.connect(duckExpressAddress, deployer)

  const [
    asCustomer,
    asCourier,
    asAddressee,
  ] = connectToSmartContract(wallets)

  console.log('\n----------SIMPLE SCENARIO----------')

  console.log('[CUSTOMER]   Approving the ERC-20 tokens...')
  await asCustomer(token).approve(duckExpress.address, 10_000)

  console.log('[CUSTOMER]   Creating a delivery offer...')
  await waitForTx(asCustomer(duckExpress).createDeliveryOffer({
    nonce: BigNumber.from(0),
    customerAddress: customer.address,
    addresseeAddress: addressee.address,
    pickupAddress: utils.formatBytes32String('Bulwarowa 20 Kraków 31-751'),
    deliveryAddress: utils.formatBytes32String('Opatowska 48 Warszawa 01-622'),
    deliveryTime: BigNumber.from(2 * 24 * 3600), // 2 days
    tokenAddress: token.address,
    reward: BigNumber.from(1000),
    collateral: BigNumber.from(2000),
  }, {
    gasLimit: GAS_LIMIT,
  }))

  console.log('[COURIER]    Browsing all available delivery offers...')
  const offers = await duckExpress.offers()
  const offerHash = offers[0].offerHash
  console.log(`[COURIER]    Found ${offers.length} available delivery offers`)

  console.log('[COURIER]    Approving the ERC-20 tokens...')
  await asCourier(token).approve(duckExpress.address, 10_000)

  console.log('[COURIER]    Accepting the delivery offer...')
  await waitForTx(asCourier(duckExpress).acceptDeliveryOffer(offerHash, {
    gasLimit: GAS_LIMIT,
  }))

  console.log('[COURIER]    Picking up the package...')
  console.log('[CUSTOMER]   Confirming pick up...')
  await waitForTx(asCustomer(duckExpress).confirmPickUp(offerHash, {
    gasLimit: GAS_LIMIT,
  }))

  console.log('[COURIER]    Delivering the package...')
  console.log('[ADDRESSEE]  Confirming delivery...')
  await waitForTx(asAddressee(duckExpress).confirmDelivery(offerHash, {
    gasLimit: GAS_LIMIT,
  }))

  console.log('\n--------------RESULTS--------------')

  const order = await duckExpress.order(offerHash)

  if (order.status === 2) {
    console.log('[SUCCESS] Delivery was successful!')
  } else {
    console.log(`[ERROR] Something went wrong with the delivery. Expected status 2 but got ${order.status} instead`)
  }
})()

function generateWallets(provider: providers.Provider): [Wallet, Wallet, Wallet] {
  return [
    Wallet.createRandom().connect(provider),
    Wallet.createRandom().connect(provider),
    Wallet.createRandom().connect(provider),
  ]
}

async function populateWalletsWithEther(deployer: Wallet, wallets: Wallet[], amount: BigNumber) {
  for (const wallet of wallets) {
    const transaction = await deployer.sendTransaction({
      to: wallet.address,
      value: amount,
    })
    await transaction.wait()
  }
}

function connectToSmartContract(
  wallets: [Wallet, Wallet, Wallet],
) {
  return [
    asWalletFactory(wallets[0]),
    asWalletFactory(wallets[1]),
    asWalletFactory(wallets[2]),
  ]
}
