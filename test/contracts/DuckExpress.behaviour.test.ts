import { expect } from 'chai'
import { loadFixture } from 'ethereum-waffle'
import { BigNumber, Wallet, utils } from 'ethers'
import sinon from 'sinon'
import { DuckExpress, ERC20 } from '../../build'
import { Offer } from '../../src/models/Offer'
import { duckExpressFixture } from '../fixtures/duckExpressFixture'
import { AsWalletFunction } from '../helpers/asWalletFactory'
import { createDeliveryOfferParams, DeliveryOfferParams } from '../helpers/createDeliveryOfferParams'
import { hashOffer } from '../helpers/hashOffer'
import { randomAddress } from '../helpers/randomAddress'

describe('DuckExpress', () => {
  let duckExpress: DuckExpress
  let token: ERC20
  let customer: Wallet
  let courier: Wallet
  let addressee: Wallet
  let asCustomer: AsWalletFunction
  let asCourier: AsWalletFunction
  let asAddressee: AsWalletFunction

  beforeEach(async () => {
    ({
      duckExpress,
      token,
      customer,
      courier,
      addressee,
      asCustomer,
      asCourier,
      asAddressee,
    } = await loadFixture(
      duckExpressFixture,
    ))
  })

  function getDefaultParams(): DeliveryOfferParams {
    return {
      nonce: 0,
      customerAddress: customer.address,
      addresseeAddress: addressee.address,
      pickupAddress: 'Bulwarowa 20 Kraków 31-751',
      deliveryAddress: 'Opatowska 48 Warszawa 01-622',
      deliveryTime: 2 * 24 * 3600, // 2 days
      tokenAddress: token.address,
      reward: 1001,
      collateral: 2000,
    }
  }

  async function prepareDuckExpress() {
    await duckExpress.supportToken(token.address)
    await asCourier(token).approve(duckExpress.address, 10_000)
    await asCustomer(token).approve(duckExpress.address, 10_000)
  }

  describe('offerStatus', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
    })

    it('reverts for invalid offer hash', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).offerStatus(invalidHash)).to.be.revertedWith(
        'DuckExpress: no offer with provided hash',
      )
    })

    it('returns correct available status', async () => {
      expect(await duckExpress.offerStatus(offerHash)).to.eq(1)

      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
    })

    it('returns correct accepted status', async () => {
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      expect(await duckExpress.offerStatus(offerHash)).to.eq(2)
    })

    it('returns correct canceled status', async () => {
      await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
      expect(await duckExpress.offerStatus(offerHash)).to.eq(3)
    })
  })

  describe('offers', () => {
    let offerHash1: string
    let offerHash2: string
    let defaultParams1: DeliveryOfferParams
    let defaultParams2: DeliveryOfferParams
    let params1: readonly [Offer]
    let params2: readonly [Offer]

    beforeEach(async () => {
      defaultParams1 = getDefaultParams()
      params1 = await createDeliveryOfferParams(defaultParams1)
      defaultParams2 = defaultParams1
      defaultParams2.customerAddress = courier.address
      defaultParams2.addresseeAddress = customer.address
      defaultParams2.reward = 5750
      params2 = await createDeliveryOfferParams(defaultParams2)
      offerHash1 = hashOffer(params1[0])
      offerHash2 = hashOffer(params2[0])
      await prepareDuckExpress()
    })

    it('returns empty array if no offers were created', async () => {
      const offers = await duckExpress.offers()
      expect(offers).to.be.of.length(0)
    })

    it('returns correct offers with correct statuses', async () => {
      await asCustomer(duckExpress).createDeliveryOffer(...params1)
      await asCourier(duckExpress).createDeliveryOffer(...params2)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash1)

      const offers = await duckExpress.offers()
      expect(offers).to.be.of.length(2)
      expect(offers[0].offerHash).to.eq(offerHash1)
      expect(offers[0].offerStatus).to.eq(2)
      expect(offers[1].offerHash).to.eq(offerHash2)
      expect(offers[1].offerStatus).to.eq(1)
    })
  })

  describe('offer', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
    })

    it('reverts for invalid offer hash', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).offer(invalidHash)).to.be.revertedWith(
        'DuckExpress: no offer with provided hash',
      )
    })

    it('returns correct offer', async () => {
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
  })

  describe('order', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
    })

    it('reverts for invalid offer hash', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).order(invalidHash)).to.be.revertedWith(
        'DuckExpress: no offer with provided hash',
      )
    })

    it('returns correct order', async () => {
      const order = await duckExpress.order(offerHash)
      expect(order.offer.nonce).to.eq(defaultParams.nonce)
      expect(order.offer.customerAddress).to.eq(defaultParams.customerAddress)
      expect(order.offer.addresseeAddress).to.eq(defaultParams.addresseeAddress)
      expect(utils.parseBytes32String(order.offer.pickupAddress)).to.eq(defaultParams.pickupAddress)
      expect(utils.parseBytes32String(order.offer.deliveryAddress)).to.eq(defaultParams.deliveryAddress)
      expect(order.offer.deliveryTime).to.eq(defaultParams.deliveryTime)
      expect(order.offer.tokenAddress).to.eq(defaultParams.tokenAddress)
      expect(order.offer.reward).to.eq(defaultParams.reward)
      expect(order.offer.collateral).to.eq(defaultParams.collateral)
      expect(order.status).to.eq(0) // AWAITING_PICK_UP
      expect(order.courierAddress).to.eq(courier.address)
      expect(order.timestamp.gt(0)).to.be.true
    })
  })

  describe('hashOffer', () => {
    it('returns correct hash offer', async () => {
      const params = await createDeliveryOfferParams(getDefaultParams())
      const expectedHash = hashOffer(params[0])
      expect(await duckExpress.hashOffer(...params)).to.eq(expectedHash)
    })
  })

  describe('deliveryDeadline', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
    })

    it('reverts for invalid offer hash', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).order(invalidHash)).to.be.revertedWith(
        'DuckExpress: no offer with provided hash',
      )
    })

    it('returns correct delivery deadline', async () => {
      const order = await duckExpress.order(offerHash)
      const expectedDeadline = BigNumber.from(defaultParams.deliveryTime).add(order.timestamp)
      const deadline = await duckExpress.deliveryDeadline(offerHash)
      expect(deadline).to.eq(expectedDeadline)
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
          .withArgs(customer.address, addressee.address, offerHash)
      })

      it('transfers reward tokens from customer to the contract', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        const contractBalance = await token.balanceOf(duckExpress.address)
        expect(contractBalance).to.eq(defaultParams.reward)
      })

      it('sets offer status', async () => {
        const params = await createDeliveryOfferParams(defaultParams)
        const offerHash = hashOffer(params[0])
        await asCustomer(duckExpress).createDeliveryOffer(...params)

        expect(await duckExpress.offerStatus(offerHash)).to.eq(1)
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

    it('reverts if the offer is invalid', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCourier(duckExpress).acceptDeliveryOffer(invalidHash)).to.be.revertedWith(
        'DuckExpress: no offer with provided hash',
      )
    })

    it('reverts if the offer was canceled', async () => {
      await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
      await expect(asCourier(duckExpress).acceptDeliveryOffer(offerHash)).to.be.revertedWith(
        'DuckExpress: the offer is unavailable',
      )
    })

    it('emits event', async () => {
      await expect(asCourier(duckExpress).acceptDeliveryOffer(offerHash))
        .to.emit(duckExpress, 'DeliveryOfferAccepted')
        .withArgs(customer.address, addressee.address, courier.address, offerHash)
    })

    it('sends collateral from courier to the contract', async () => {
      const balanceBefore = await token.balanceOf(duckExpress.address)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      const currentBalance = await token.balanceOf(duckExpress.address)
      expect(currentBalance).to.eq(balanceBefore.add(defaultParams.collateral))
    })

    it('saves delivery order in the contract', async () => {
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)

      const order = await duckExpress.order(offerHash)
      expect(order.status).to.eq(0) // AWAITING_PICK_UP
      expect(order.courierAddress).to.eq(courier.address)
      expect(order.timestamp.gt(BigNumber.from(0))).to.be.true
    })

    it('changes the offer status to accepted', async () => {
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      expect(await duckExpress.offerStatus(offerHash)).to.eq(2)
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

    it('reverts if the offer is invalid', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).cancelDeliveryOffer(invalidHash)).to.be.revertedWith(
        'DuckExpress: caller is not the offer creator',
      )
    })

    it('reverts if the offer was already canceled', async () => {
      await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
      await expect(asCustomer(duckExpress).cancelDeliveryOffer(offerHash)).to.be.revertedWith(
        'DuckExpress: the offer is unavailable',
      )
    })

    it('reverts if sender is not the offer creator', async () => {
      await expect(asCourier(duckExpress).cancelDeliveryOffer(offerHash)).to.be.revertedWith(
        'DuckExpress: caller is not the offer creator',
      )
    })

    it('emits event', async () => {
      await expect(asCustomer(duckExpress).cancelDeliveryOffer(offerHash))
        .to.emit(duckExpress, 'DeliveryOfferCanceled')
        .withArgs(customer.address, addressee.address, offerHash)
    })

    it('cancels the delivery offer', async () => {
      await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
      await expect(asCourier(duckExpress).acceptDeliveryOffer(offerHash)).to.be.revertedWith(
        'DuckExpress: the offer is unavailable',
      )
    })

    it('sets correct offer status', async () => {
      await asCustomer(duckExpress).cancelDeliveryOffer(offerHash)
      expect(await asCourier(duckExpress).offerStatus(offerHash)).to.eq(3)
    })
  })

  describe('confirmPickUp', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
    })

    it('reverts if there is no order with provided hash', async () => {
      const invalidHash = utils.randomBytes(32)
      await expect(asCustomer(duckExpress).confirmPickUp(invalidHash)).to.be.revertedWith(
        'DuckExpress: caller is not the offer creator',
      )
    })

    it('reverts if the order was already picked up', async () => {
      await asCustomer(duckExpress).confirmPickUp(offerHash)
      await expect(asCustomer(duckExpress).confirmPickUp(offerHash)).to.be.revertedWith(
        'DuckExpress: invalid order status',
      )
    })

    it('reverts if sender is not the offer creator', async () => {
      await expect(asCourier(duckExpress).confirmPickUp(offerHash)).to.be.revertedWith(
        'DuckExpress: caller is not the offer creator',
      )
    })

    it('reverts if the offer has invalid status', async () => {
      await asCustomer(duckExpress).confirmPickUp(offerHash)
      await expect(asCustomer(duckExpress).confirmPickUp(offerHash)).to.be.revertedWith(
        'DuckExpress: invalid order status',
      )
    })

    it('emits event', async () => {
      await expect(asCustomer(duckExpress).confirmPickUp(offerHash))
        .to.emit(duckExpress, 'PackagePickedUp')
        .withArgs(customer.address, addressee.address, courier.address, offerHash)
    })

    it('sets the order status', async () => {
      await asCustomer(duckExpress).confirmPickUp(offerHash)
      const order = await duckExpress.order(offerHash)
      expect(order.status).to.eq(1) // PICKED_UP
    })
  })

  describe('confirmDelivery', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      await asCustomer(duckExpress).confirmPickUp(offerHash)
    })

    describe('validation', () => {
      it('reverts if there is no order with provided hash', async () => {
        const invalidHash = utils.randomBytes(32)
        await expect(asAddressee(duckExpress).confirmDelivery(invalidHash)).to.be.revertedWith(
          'DuckExpress: caller is neither the offer creator nor the offer addressee',
        )
      })

      it('reverts if the order was already delivered or was not picked up yet', async () => {
        await asAddressee(duckExpress).confirmDelivery(offerHash)
        await expect(asAddressee(duckExpress).confirmDelivery(offerHash)).to.be.revertedWith(
          'DuckExpress: invalid order status',
        )
      })
    })

    describe('main behaviour - after pick up', () => {
      it('reverts if sender is not the addressee', async () => {
        await expect(asCustomer(duckExpress).confirmDelivery(offerHash)).to.be.revertedWith(
          'DuckExpress: caller is not the offer addressee',
        )
      })

      it('emits event', async () => {
        await expect(asAddressee(duckExpress).confirmDelivery(offerHash))
          .to.emit(duckExpress, 'PackageDelivered')
          .withArgs(addressee.address, courier.address, offerHash)
      })

      describe('tests not using sinon', () => {
        it('sets the order status', async () => {
          await asAddressee(duckExpress).confirmDelivery(offerHash)
          const order = await duckExpress.order(offerHash)
          expect(order.status).to.eq(2) // DELIVERED
        })

        it('transfers reward and collateral from contract to the courier', async () => {
          const courierBalanceBefore = await token.balanceOf(courier.address)

          await asAddressee(duckExpress).confirmDelivery(offerHash)

          const contractBalance = await token.balanceOf(duckExpress.address)
          const courierBalance = await token.balanceOf(courier.address)
          const rewardAndCollateral = BigNumber.from(defaultParams.reward + defaultParams.collateral)
          const expectedCourierBalance = rewardAndCollateral.add(courierBalanceBefore)

          expect(contractBalance).to.eq(0)
          expect(courierBalance).to.eq(expectedCourierBalance)
        })
      })

      describe('tests using sinon', () => {
        let sinonClock: sinon.SinonFakeTimers

        beforeEach(async () => {
          const date = new Date()
          const forwardDays = 3
          date.setDate(date.getDate() + forwardDays)
          sinonClock = sinon.useFakeTimers({
            now: date,
            toFake: ['Date'],
          })
        })

        afterEach(async () => {
          sinonClock.restore()
        })

        it('sets the order status', async () => {
          await asAddressee(duckExpress).confirmDelivery(offerHash)
          const order = await duckExpress.order(offerHash)
          expect(order.status).to.eq(3) // DELIVERED_LATE
        })

        it('transfers collateral to courier and divides reward tokens equally between customer and courier', async () => {
          const courierBalanceBefore = await token.balanceOf(courier.address)
          const customerBalanceBefore = await token.balanceOf(customer.address)

          await asAddressee(duckExpress).confirmDelivery(offerHash)

          const contractBalance = await token.balanceOf(duckExpress.address)
          const courierBalance = await token.balanceOf(courier.address)
          const customerBalance = await token.balanceOf(customer.address)

          const customerReward = Math.floor(defaultParams.reward / 2)
          const expectedCustomerBalance = BigNumber.from(customerReward).add(customerBalanceBefore)

          const courierReward = Math.ceil(defaultParams.reward / 2)
          const expectedCourierBalance = BigNumber.from(defaultParams.collateral)
            .add(BigNumber.from(courierReward))
            .add(courierBalanceBefore)

          expect(contractBalance).to.eq(0)
          expect(courierBalance).to.eq(expectedCourierBalance)
          expect(customerBalance).to.eq(expectedCustomerBalance)
        })
      })
    })

    describe('main behaviour - after addressee refusal', () => {
      beforeEach(async () => {
        await asAddressee(duckExpress).refuseDelivery(offerHash)
      })

      it('reverts if sender is not the customer', async () => {
        await expect(asAddressee(duckExpress).confirmDelivery(offerHash)).to.be.revertedWith(
          'DuckExpress: caller is not the offer creator',
        )
      })

      it('emits event', async () => {
        await expect(asCustomer(duckExpress).confirmDelivery(offerHash))
          .to.emit(duckExpress, 'PackageReturned')
          .withArgs(customer.address, courier.address, offerHash)
      })

      it('sets the order status', async () => {
        await asCustomer(duckExpress).confirmDelivery(offerHash)
        const order = await duckExpress.order(offerHash)
        expect(order.status).to.eq(7) // RETURNED
      })

      it('transfers reward and collateral from contract to the courier', async () => {
        const courierBalanceBefore = await token.balanceOf(courier.address)

        await asCustomer(duckExpress).confirmDelivery(offerHash)

        const contractBalance = await token.balanceOf(duckExpress.address)
        const courierBalance = await token.balanceOf(courier.address)
        const rewardAndCollateral = BigNumber.from(defaultParams.reward + defaultParams.collateral)
        const expectedCourierBalance = rewardAndCollateral.add(courierBalanceBefore)

        expect(contractBalance).to.eq(0)
        expect(courierBalance).to.eq(expectedCourierBalance)
      })
    })
  })

  describe('refuseDelivery', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      await asCustomer(duckExpress).confirmPickUp(offerHash)
    })

    describe('validation', () => {
      it('reverts if there is no order with provided hash', async () => {
        const invalidHash = utils.randomBytes(32)
        await expect(asAddressee(duckExpress).refuseDelivery(invalidHash)).to.be.revertedWith(
          'DuckExpress: caller is neither the offer creator nor the offer addressee',
        )
      })

      it('reverts if the order was already delivered or was not picked up yet', async () => {
        await asAddressee(duckExpress).confirmDelivery(offerHash)
        await expect(asAddressee(duckExpress).refuseDelivery(offerHash)).to.be.revertedWith(
          'DuckExpress: invalid order status',
        )
      })
    })

    describe('main behaviour - after pick up', () => {
      it('reverts if sender is not the addressee', async () => {
        await expect(asCustomer(duckExpress).refuseDelivery(offerHash)).to.be.revertedWith(
          'DuckExpress: caller is not the offer addressee',
        )
      })

      it('emits event', async () => {
        await expect(asAddressee(duckExpress).refuseDelivery(offerHash))
          .to.emit(duckExpress, 'DeliveryRefused')
          .withArgs(customer.address, addressee.address, courier.address, offerHash)
      })

      it('sets the order status', async () => {
        await asAddressee(duckExpress).refuseDelivery(offerHash)
        const order = await duckExpress.order(offerHash)
        expect(order.status).to.eq(4) // REFUSED
      })
    })

    describe('main behaviour - after addressee refusal', () => {
      beforeEach(async () => {
        await asAddressee(duckExpress).refuseDelivery(offerHash)
      })

      it('reverts if sender is not the customer', async () => {
        await expect(asAddressee(duckExpress).refuseDelivery(offerHash)).to.be.revertedWith(
          'caller is not the offer creator',
        )
      })

      it('emits event', async () => {
        await expect(asCustomer(duckExpress).refuseDelivery(offerHash))
          .to.emit(duckExpress, 'DeliveryFailed')
          .withArgs(customer.address, addressee.address, courier.address, offerHash)
      })

      it('sets the order status', async () => {
        await asCustomer(duckExpress).refuseDelivery(offerHash)
        const order = await duckExpress.order(offerHash)
        expect(order.status).to.eq(5) // FAILED
      })

      it('transfers reward and collateral from contract to the customer', async () => {
        const customerBalanceBefore = await token.balanceOf(customer.address)

        await asCustomer(duckExpress).refuseDelivery(offerHash)

        const contractBalance = await token.balanceOf(duckExpress.address)
        const customerBalance = await token.balanceOf(customer.address)
        const rewardAndCollateral = BigNumber.from(defaultParams.reward + defaultParams.collateral)
        const expectedCustomerBalance = rewardAndCollateral.add(customerBalanceBefore)

        expect(contractBalance).to.eq(0)
        expect(customerBalance).to.eq(expectedCustomerBalance)
      })
    })
  })

  describe('claimCollateral', () => {
    let offerHash: string
    let defaultParams: DeliveryOfferParams

    beforeEach(async () => {
      defaultParams = getDefaultParams()
      const params = await createDeliveryOfferParams(defaultParams)
      offerHash = hashOffer(params[0])
      await prepareDuckExpress()
      await asCustomer(duckExpress).createDeliveryOffer(...params)
      await asCourier(duckExpress).acceptDeliveryOffer(offerHash)
      await asCustomer(duckExpress).confirmPickUp(offerHash)
    })

    describe('validation', () => {
      it('reverts if there is no order with provided hash or the caller is not the customer', async () => {
        const invalidHash = utils.randomBytes(32)
        await expect(asCustomer(duckExpress).claimCollateral(invalidHash)).to.be.revertedWith(
          'DuckExpress: caller is not the offer creator',
        )
      })

      it('reverts if the order was already delivered or was declined', async () => {
        await asAddressee(duckExpress).confirmDelivery(offerHash)
        await expect(asCustomer(duckExpress).claimCollateral(offerHash)).to.be.revertedWith(
          'DuckExpress: invalid order status',
        )
      })

      it('reverts if the delivery deadline has not passed yet', async () => {
        await expect(asCustomer(duckExpress).claimCollateral(offerHash)).to.be.revertedWith(
          'DuckExpress: the delivery time has not passed yet',
        )
      })
    })

    describe('tests using sinon', () => {
      let sinonClock: sinon.SinonFakeTimers

      beforeEach(async () => {
        const date = new Date()
        const forwardDays = 3
        date.setDate(date.getDate() + forwardDays)
        sinonClock = sinon.useFakeTimers({
          now: date,
          toFake: ['Date'],
        })
      })

      afterEach(async () => {
        sinonClock.restore()
      })

      it('emits event', async () => {
        await expect(asCustomer(duckExpress).claimCollateral(offerHash))
          .to.emit(duckExpress, 'CollateralClaimed')
          .withArgs(customer.address, courier.address, offerHash)
      })

      it('sets the order status', async () => {
        await asCustomer(duckExpress).claimCollateral(offerHash)
        const order = await duckExpress.order(offerHash)
        expect(order.status).to.eq(6) // CLAIMED
      })

      it('transfers reward and collateral from contract to the courier', async () => {
        const customerBalanceBefore = await token.balanceOf(customer.address)

        await asCustomer(duckExpress).claimCollateral(offerHash)

        const contractBalance = await token.balanceOf(duckExpress.address)
        const customerBalance = await token.balanceOf(customer.address)
        const rewardAndCollateral = BigNumber.from(defaultParams.reward + defaultParams.collateral)
        const expectedCustomerBalance = rewardAndCollateral.add(customerBalanceBefore)

        expect(contractBalance).to.eq(0)
        expect(customerBalance).to.eq(expectedCustomerBalance)
      })
    })
  })
})
