import { ListItem } from "@chakra-ui/react";
import { OffersOffer } from "../hooks/offers";

interface OfferItemProps {
  key: number
  offer: OffersOffer
}

function parseOfferStatus(status: number) {
  const statuses = [
    "AVAILABLE",
    "ACCEPTED",
    "CANCELED"
  ]

  return statuses[status]
}

export default function OfferItem(props: OfferItemProps ) {
  return (
    <ListItem key={props.key} fontSize={14}>
      <b>[{parseOfferStatus(props.offer.offerStatus)}]</b>{"\t\t\t\t" + props.offer.offerHash}
    </ListItem>
  );
}
