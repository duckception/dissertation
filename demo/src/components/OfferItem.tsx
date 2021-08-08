import { Text } from '@chakra-ui/react'
import { utils } from 'ethers'
import { Offer } from '../models/offer'

interface OfferItemProps {
  offer: Offer
}

export default function OfferItem(props: OfferItemProps) {
  const offer = props.offer
  return (
    <>
      <Text><b>Nonce:</b> {offer.nonce.toString()}</Text>
      <Text><b>Customer address:</b> {offer.customerAddress}</Text>
      <Text><b>Addressee address:</b> {offer.addresseeAddress}</Text>
      <Text><b>Pickup address:</b> {utils.parseBytes32String(offer.pickupAddress)}</Text>
      <Text><b>Delivery address:</b> {utils.parseBytes32String(offer.deliveryAddress)}</Text>
      <Text><b>Delivery time: </b> {offer.deliveryTime.toNumber() / 3600}h</Text>
      <Text><b>Token address: </b> {offer.tokenAddress}</Text>
      <Text><b>Reward: </b> {utils.formatEther(offer.reward)} tokens</Text>
      <Text><b>Collateral: </b> {utils.formatEther(offer.collateral)} tokens</Text>
    </>
  )
}
