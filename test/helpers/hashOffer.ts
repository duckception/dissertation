import { rawEncode } from 'ethereumjs-abi'
import { utils } from 'ethers'
import { Offer } from '../../src/models/Offer'

export function hashOffer(sender: string, offer: Offer) {
  return utils.keccak256(
    rawEncode(
      ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256'],
      [
        sender,
        offer.nonce.toString(),
        offer.deliveryTime.toString(),
        offer.tokenAddress.toString(),
        offer.reward.toString(),
        offer.collateral.toString(),
      ],
    ),
  )
}
