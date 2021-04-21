import { expect } from 'chai'
import { loadFixture } from 'ethereum-waffle'
import { constants, Wallet } from 'ethers'
import { DuckExpress } from '../../build'
import { duckExpressFixture } from '../fixtures/duckExpressFixture'
import { WalletOrAddress, toAddress } from '../helpers/toAddress'

describe('DuckExpress - Ownable behaviour', () => {
  let duckExpress: DuckExpress
  let other: Wallet
  let deployer: Wallet

  function transferOwnership(caller: Wallet, newOwner: WalletOrAddress) {
    return duckExpress.connect(caller).transferOwnership(toAddress(newOwner))
  }

  beforeEach(async () => {
    ({
      duckExpress,
      customer: other,
      deployer,
    } = await loadFixture(duckExpressFixture))
  })

  it('should have an owner', async () => {
    expect(await duckExpress.owner()).to.eq(deployer.address)
  })

  it('changes owner after transfer', async () => {
    await expect(transferOwnership(deployer, other))
      .to.emit(duckExpress, 'OwnershipTransferred')
      .withArgs(deployer.address, other.address)

    expect(await duckExpress.owner()).to.eq(other.address)
  })

  it('should prevent non-owners from transferring', async () => {
    await expect(transferOwnership(other, Wallet.createRandom())).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('should guard ownership against stuck state', async () => {
    await expect(transferOwnership(deployer, constants.AddressZero)).to.be.revertedWith(
      'Ownable: new owner is the zero address',
    )
  })
})
