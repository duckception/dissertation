import { expect } from 'chai'
import { MockProvider, loadFixture } from 'ethereum-waffle'
import { BigNumber, Wallet, utils } from 'ethers'
import { DuckExpress, ERC20 } from '../../build'
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
    ({
      provider,
      duckExpress,
      token,
      customer,
      courier,
      asCustomer,
      asCourier,
    } = await loadFixture(
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
    it('returns correct hash offer', async () => {
      const params = await createDeliveryOfferParams(getDefaultParams())
      const expectedHash = hashOffer(params[0])
      expect(await duckExpress.hashOffer(...params)).to.eq(expectedHash)
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

    describe('parameters validation (with already supported token)', () => {
      beforeEach(async () => {
        await duckExpress.supportToken(token.address)
      })

      it('reverts for invalid nonce', async () => {
        defaultParams = {
          ...defaultParams,
          nonce: 999,
        }

        const params = await createDeliveryOfferParams(defaultParams)
        await expect(asCustomer(duckExpress).createDeliveryOffer(...params)).to.be.revertedWith(
          'DuckExpress: incorrect nonce',
        )
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
        const offerHash = hashOffer(params[0])
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
        const offerHash = hashOffer(params[0])
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.isOfferAvailable(offerHash)).to.be.true
      })

      it('saves offer in the contract', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        const offerHash = hashOffer(params[0])
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        const offer = await duckExpress.offer(offerHash)
        expect(offer.nonce).to.eq(defaultParams.nonce)
        expect(offer.customerAddress).to.eq(defaultParams.customerAddress)
        expect(offer.addresseeAddress).to.eq(defaultParams.addresseeAddress)
        expect(utils.parseBytes32String(offer.pickupAddress)).to.eq(defaultParams.pickupAddress)
        expect(utils.parseBytes32String(offer.deliveryAddress)).to.eq(defaultParams.deliveryAddress)
        expect(offer.deliveryTime).to.eq(defaultParams.deliveryTime)
        expect(offer.tokenAddress).to.eq(defaultParams.tokenAddress)
        expect(offer.reward).to.eq(defaultParams.reward)
        expect(offer.collateral).to.eq(defaultParams.collateral)
      })

      it('increments customer\'s nonce', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.customerNonce(customer.address)).to.eq(BigNumber.from(1))
      })
    })
  })

  describe('acceptDeliveryOffer', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
    })

    describe('main behaviour', () => {
      it('reverts if the offer is unavailable', async () => {
        const invalidHash = utils.randomBytes(32)
        await expect(asCourier(duckExpress).acceptDeliveryOffer(invalidHash)).to.be.revertedWith(
          'DuckExpress: the offer is unavailable',
        )
      })

      it('emits event', async () => {
        await expect(asCourier(duckExpress).acceptDeliveryOffer(offerHash))
          .to.emit(duckExpress, 'DeliveryOfferAccepted')
          .withArgs(courier.address, offerHash)
      })

      it('sends collateral to the contract', async () => {
        const balanceBefore = await token.balanceOf(duckExpress.address)
        await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
        const currentBalance = await token.balanceOf(duckExpress.address)
        expect(currentBalance).to.eq(balanceBefore.add(defaultParams.collateral))
      })

      it('saves delivery order in the contract', async () => {
        await asCourier(duckExpress).acceptDeliveryOffer(offerHash)

        const order = await duckExpress.order(offerHash)
        expect(order.status).to.eq(0)
        expect(order.courierAddress).to.eq(courier.address)
        expect(order.timestamp.gt(BigNumber.from(0))).to.be.true
      })

      it('changes the offer status to unavailable', async () => {
        await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
        expect(await duckExpress.isOfferAvailable(offerHash)).to.be.false
      })
    })
  })

  describe('cancelDeliveryOffer', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
    })

    describe('main behaviour', () => {
      it('reverts if the offer is unavailable', async () => {
        const invalidHash = utils.randomBytes(32)
        await expect(asCustomer(duckExpress).cancelDeliveryOffer(invalidHash)).to.be.revertedWith(
          'DuckExpress: the offer is unavailable',
        )
      })

      it('reverts if sender is not the offer creator', async () => {
        await expect(asCourier(duckExpress).cancelDeliveryOffer(offerHash)).to.be.revertedWith(
          'DuckExpress: you are not the create of this offer',
        )
      })

      it('emits event', async () => {
        await expect(asCustomer(duckExpress).cancelDeliveryOffer(offerHash))
          .to.emit(duckExpress, 'DeliveryOfferCanceled')
          .withArgs(offerHash)
      })

      it('cancels the delivery offer', async () => {
        await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
        await expect(asCourier(duckExpress).acceptDeliveryOffer(offerHash)).to.be.revertedWith(
          'DuckExpress: the offer is unavailable',
        )
      })
    })
  })
})
