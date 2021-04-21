import { expect } from 'chai'
import { loadFixture } from 'ethereum-waffle'
import { constants, Wallet } from 'ethers'
import { DuckExpress, DuckExpress__factory } from '../../build'
import { randomAddress } from '../helpers/randomAddress'
import { deployProxy } from '../helpers/deployProxy'
import { deployDuckExpress } from '../helpers/deployDuckExpress'

describe('DuckExpress - Initializable behaviour', () => {
  const stakingToken = randomAddress()
  const minDeliveryTime = 12 * 3600

  let DuckExpress: DuckExpress
  let other: Wallet
  let deployer: Wallet

  async function fixture([deployer, other]: Wallet[]) {
    const implementation = await deployDuckExpress(deployer, constants.AddressZero)
    const proxy = await deployProxy(deployer, implementation.address, randomAddress())
    const DuckExpress = DuckExpress__factory.connect(proxy.address, deployer)
    return { deployer, other, DuckExpress }
  }

  beforeEach(async () => {
    ({ DuckExpress, other, deployer } = await loadFixture(fixture))
  })

  function initialize(caller: Wallet, newOwner: string) {
    return DuckExpress.connect(caller).initialize(newOwner, minDeliveryTime)
  }

  describe('initialize', () => {
    it('can be called by other address than contract deployer', async () => {
      await expect(initialize(other, other.address)).to.be.fulfilled
    })

    it('cannot be called twice', async () => {
      await initialize(deployer, deployer.address)
      await expect(initialize(deployer, deployer.address)).to.be.revertedWith(
        'Contract instance has already been initialized',
      )
    })

    it('makes the address passed to the init function the owner of the contract', async () => {
      await initialize(deployer, other.address)
      expect(await DuckExpress.owner()).to.eq(other.address)
    })

    it('sets the min expiration time', async () => {
      await initialize(deployer, deployer.address)
      expect(await DuckExpress.minDeliveryTime()).to.eq(minDeliveryTime)
    })
  })
})
