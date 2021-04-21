import { BigNumber } from 'ethers'

export interface Offer {
  nonce: BigNumber,
  deliveryTime: BigNumber,
  tokenAddress: string,
  reward: BigNumber,
  collateral: BigNumber,
}
