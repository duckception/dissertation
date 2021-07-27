import { ListItem } from "@chakra-ui/react";
import { OffersOffer } from "../hooks/offers";

interface OfferItemProps {
  key: number
  offer: OffersOffer
}

export default function OfferItem(props: OfferItemProps ) {
  return (
    props.offer.offerStatus === 0 ?
      <ListItem key={props.key} fontSize={14}>
        {props.offer.offerHash}
      </ListItem>
    :
    <></>
  );
}
