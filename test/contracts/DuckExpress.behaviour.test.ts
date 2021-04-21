import { expect } from 'chai'
import { MockProvider, loadFixture } from 'ethereum-waffle'
import { BigNumber, Wallet, utils } from 'ethers'
import { DuckExpress, ERC20 } from '../../build'
import { Offer } from '../../src/models/Offer'
import { duckExpressFixture } from '../fixtures/duckExpressFixture'
import { AsWalletFunction } from '../helpers/asWalletFactory'
import { createDeliveryOfferParams, DeliveryOfferParams } from '../helpers/createDeliveryOfferParams'
import { hashOffer } from '../helpers/hashOffer'
import { randomAddress } from '../helpers/randomAddress'

describe.only('DuckExpress', () => {
  let provider: MockProvider
  let duckExpress: DuckExpress
  let token: ERC20
  let customer: Wallet
  let courier: Wallet
  let asCustomer: AsWalletFunction
  let asCourier: AsWalletFunction

  beforeEach(async () => {
    ;({ provider, duckExpress, token, customer, courier, asCustomer, asCourier } = await loadFixture(
      duckExpressFixture,
    ))
  })
  function getDefaultParams(): DeliveryOfferParams {
    return {
      nonce: 0,
      customerAddress: customer.address,
      addresseeAddress: randomAddress(),
      pickupAddress: 'Bulwarowa 20 Kraków 31-751',
      deliveryAddress: 'Opatowska 48 Warszawa 01-622',
      deliveryTime: 12 * 3600,
      tokenAddress: token.address,
      reward: 1000,
      collateral: 2000,
    }
  }

  async function prepareDuckExpress() {
    await duckExpress.supportToken(token.address)
    await asCourier(token).approve(duckExpress.address, 10_000)
    await asCustomer(token).approve(duckExpress.address, 10_000)
  }

  describe('hashOffer', () => {
    const offer: Offer = {
      nonce: BigNumber.from(0),
      deliveryTime: BigNumber.from(420),
      tokenAddress: randomAddress(),
      reward: BigNumber.from(100),
      collateral: BigNumber.from(200),
    }

    it('returns correct hash offer', async () => {
      const expectedHash = hashOffer(customer.address, offer)
      expect(await asCustomer(duckExpress).hashOffer(offer)).to.eq(expectedHash)
    })
  })

  describe('createDeliveryOffer', () => {
    let defaultParams: DeliveryOfferParams

    beforeEach(() => {
      defaultParams = getDefaultParams()
    })

    describe('parameter validation', () => {
      it('reverts for not supported ERC20 loan token', async () => {
        defaultParams = {
          ...defaultParams,
          tokenAddress: randomAddress(),
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(duckExpress.createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the ERC20 loan token is not supported',
        )
      })
    })

    describe.only('parameters validation (with already supported token)', () => {
      beforeEach(async () => {
        await duckExpress.supportToken(token.address)
      })

      it('reverts for invalid nonce', async () => {
        defaultParams = {
          ...defaultParams,
          nonce: 999,
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith('DuckExpress: incorrect nonce')
      })

      it('reverts for invalid customer address', async () => {
        defaultParams = {
          ...defaultParams,
          customerAddress: randomAddress(),
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: customer address must be your address',
        )
      })

      it('reverts for empty pickup address', async () => {
        defaultParams = {
          ...defaultParams,
          pickupAddress: '',
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the pickup address must be set',
        )
      })

      it('reverts for empty delivery address', async () => {
        defaultParams = {
          ...defaultParams,
          deliveryAddress: '',
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the delivery address must be set',
        )
      })

      it('reverts for too small delivery time', async () => {
        defaultParams = {
          ...defaultParams,
          deliveryTime: 999,
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the delivery time cannot be lesser than the minimal delivery time',
        )
      })

      it('reverts for too small reward', async () => {
        defaultParams = {
          ...defaultParams,
          reward: 0,
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the reward must be greater than 0',
        )
      })

      it('reverts for too small collateral', async () => {
        defaultParams = {
          ...defaultParams,
          collateral: 0,
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: the collateral must be greater than 0',
        )
      })
    })

    describe('main behaviour', () => {
      beforeEach(async () => {
        await prepareDuckExpress()
      })

      it('emits offer hash', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        const offerHash = hashOffer(customer.address, params[0])
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params))
          .to.emit(duckExpress, 'DeliveryOfferCreated')
          .withArgs(customer.address, offerHash)
      })

      it('transfers reward tokens from customer to the contract', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        const contractBalance = await token.balanceOf(duckExpress.address)
        expect(contractBalance).to.eq(1000)
      })

      it('sets offer status', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        const offerHash = hashOffer(customer.address, params[0])
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.isOfferAvailable(offerHash)).to.be.true
      })

      it('saves offer in the contract', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        const offerHash = hashOffer(customer.address, params[0])
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.offer(offerHash)).to.eq
      })

      it("increments customer's nonce", async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.customerNonce(customer.address)).to.eq(BigNumber.from(1))
      })
    })
  })
})
