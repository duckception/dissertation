import { expect } from 'chai'
import { loadFixture } from 'ethereum-waffle'
import { DuckExpress, ERC20 } from '../../build'
import { duckExpressFixture } from '../fixtures/duckExpressFixture'
import { AsWalletFunction } from '../helpers/asWalletFactory'

describe('DuckExpressConfig', () => {
  let duckExpress: DuckExpress
  let token: ERC20
  let asCourier: AsWalletFunction

  beforeEach(async () => {
    ({
      duckExpress,
      token,
      asCourier,
    } = await loadFixture(
      duckExpressFixture,
    ))
  })

  describe('setMinDeliveryTime', () => {
    const newMinDeliveryTime = 10 * 24 * 3600 // 10 days

    it('is only callable by the owner', async () => {
      await expect(asCourier(duckExpress).setMinDeliveryTime(newMinDeliveryTime)).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('emits an event', async () => {
      await expect(duckExpress.setMinDeliveryTime(newMinDeliveryTime))
        .to.emit(duckExpress, 'MinDeliveryTimeSet')
        .withArgs(newMinDeliveryTime)
    })

    it('sets new min delivery time', async () => {
      await duckExpress.setMinDeliveryTime(newMinDeliveryTime)

      expect(await duckExpress.minDeliveryTime()).to.eq(newMinDeliveryTime)
    })

    it('reverts for invalid timelock period', async () => {
      await expect(duckExpress.setMinDeliveryTime(0)).to.be.revertedWith('DuckExpress: the min expiration time must be greater than 0')
    })
  })

  describe('supportToken', () => {
    it('is only callable by the owner', async () => {
      await expect(asCourier(duckExpress).supportToken(token.address))
        .to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('supports a loan token', async () => {
      await duckExpress.supportToken(token.address)

      expect(await duckExpress.isTokenSupported(token.address)).to.be.true
    })

    it('emits correct events', async () => {
      await expect(duckExpress.supportToken(token.address))
        .to.emit(duckExpress, 'TokenSupported')
        .withArgs(token.address)
    })

    it('reverts for already supported loan token', async () => {
      await duckExpress.supportToken(token.address)
      await expect(duckExpress.supportToken(token.address))
        .to.be.revertedWith('DuckExpress: the ERC20 token is already supported')
    })
  })

  describe('stopSupportingToken', () => {
    beforeEach(async () => {
      await duckExpress.supportToken(token.address)
    })

    it('is only callable by the owner', async () => {
      await expect(asCourier(duckExpress).stopSupportingToken(token.address))
        .to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('stop supporting a loan token', async () => {
      await duckExpress.stopSupportingToken(token.address)

      expect(await duckExpress.isTokenSupported(token.address)).to.be.false
      expect(await duckExpress.wasTokenEverSupported(token.address)).to.be.true
    })

    it('emits correct events', async () => {
      await expect(duckExpress.stopSupportingToken(token.address))
        .to.emit(duckExpress, 'TokenSupportStopped')
        .withArgs(token.address)
    })

    it('reverts for already supported loan token', async () => {
      await duckExpress.stopSupportingToken(token.address)
      await expect(duckExpress.stopSupportingToken(token.address))
        .to.be.revertedWith('DuckExpress: the ERC20 loan token is not supported')
    })
  })
})
