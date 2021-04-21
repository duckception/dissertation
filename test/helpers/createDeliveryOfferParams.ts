import { BigNumber, utils } from 'ethers'

export interface DeliveryOfferParams {
  nonce: number,
  customerAddress: string,
  addresseeAddress: string,
  pickupAddress: string,
  deliveryAddress: string,
  deliveryTime: number,
  tokenAddress: string,
  reward: number,
  collateral: number,
}

export async function createDeliveryOfferParams(params: DeliveryOfferParams) {
  const parsedOffer = {
    nonce: BigNumber.from(params.nonce),
    customerAddress: params.customerAddress,
    addresseeAddress: params.addresseeAddress,
    pickupAddress: utils.formatBytes32String(params.pickupAddress),
    deliveryAddress: utils.formatBytes32String(params.deliveryAddress),
    deliveryTime: BigNumber.from(params.deliveryTime),
    tokenAddress: params.tokenAddress,
    reward: BigNumber.from(params.reward),
    collateral: BigNumber.from(params.collateral),
  }

  return [parsedOffer] as const
}
