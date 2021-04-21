import { BigNumber, Wallet } from 'ethers'
import { Offer } from '../../src/models/Offer'

export interface DeliveryOfferParams {
  customer: Wallet,
  verifyingContractAddress: string,
  nonce: number,
  deliveryTime: number,
  tokenAddress: string,
  reward: number,
  collateral: number,
}

export async function createDeliveryOfferParams(params: DeliveryOfferParams) {
  const offer: Offer = {
    nonce: BigNumber.from(params.nonce),
    deliveryTime: BigNumber.from(params.deliveryTime),
    tokenAddress: params.tokenAddress,
    reward: BigNumber.from(params.reward),
    collateral: BigNumber.from(params.collateral),
  }

  return [offer] as const
}
