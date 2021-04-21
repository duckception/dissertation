import { rawEncode } from 'ethereumjs-abi'
import { utils } from 'ethers'
import { Offer } from '../../src/models/Offer'

export function hashOffer(offer: Offer) {
  return utils.keccak256(
    rawEncode(
      ['uint256', 'address', 'address', 'bytes32', 'bytes32', 'uint256', 'address', 'uint256', 'uint256'],
      [
        offer.nonce.toString(),
        offer.customerAddress,
        offer.addresseeAddress,
        offer.pickupAddress,
        offer.deliveryAddress,
        offer.deliveryTime.toString(),
        offer.tokenAddress,
        offer.reward.toString(),
        offer.collateral.toString(),
      ],
    ),
  )
}
