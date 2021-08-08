import { ListItem } from '@chakra-ui/react'
import { OffersOffer } from '../hooks/offers'

interface OfferItemProps {
  propKey: number
  offer: OffersOffer
}

function parseOfferStatus(status: number) {
  const statuses = [
    'AVAILABLE',
    'ACCEPTED',
    'CANCELED'
  ]

  return statuses[status]
}

export default function OffersItem(props: OfferItemProps) {
  return (
    <ListItem key={props.propKey} fontSize={14}>
      <b>[{parseOfferStatus(props.offer.offerStatus)}]</b>{'\t\t\t\t' + props.offer.offerHash}
    </ListItem>
  )
}
