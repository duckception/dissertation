import { List } from "@chakra-ui/react";
import { useOffers, OffersOffer } from "../hooks/offers";
import OffersItem from "./OffersItem";

const listOffers = (offers: OffersOffer[]) => {
  return offers.map((offer, i) => {
    return (
      <OffersItem key={i} propKey={i} offer={offer} />
    )
  })
}

export default function Offers() {
  const offers = useOffers();
  return (
    offers.length > 0 ?
      <List spacing={3}>
        {listOffers(offers)}
      </List>
    :
      <></>
  );
}
