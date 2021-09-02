import { BigNumber } from 'ethers'

export interface Offer {
  nonce: BigNumber,
  customerAddress: string,
  addresseeAddress: string,
  pickupAddress: string,
  deliveryAddress: string,
  deliveryTime: BigNumber,
  tokenAddress: string,
  reward: BigNumber,
  collateral: BigNumber,
}
