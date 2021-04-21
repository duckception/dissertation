import { Wallet } from 'ethers'
import { ERC20PresetMinterPauser as ERC20, ERC20PresetMinterPauser__factory } from '../../build'

export async function erc20TokenFixture([wallet1, wallet2]: Wallet[]) {
  const token = await deployToken(wallet1)
  const tokenAmount = 10_000_000
  await mintToken(token, wallet1, tokenAmount)
  await mintToken(token, wallet2, tokenAmount)

  return {
    wallet1,
    wallet2,
    token,
  }
}

async function deployToken(deployer: Wallet): Promise<ERC20> {
  const factory = new ERC20PresetMinterPauser__factory(deployer)
  const token = await factory.deploy('TestDuck', 'TDK')
  return token.deployed()
}

async function mintToken(token: ERC20, recipient: Wallet, amount: number) {
  await token.mint(recipient.address, amount)
}
