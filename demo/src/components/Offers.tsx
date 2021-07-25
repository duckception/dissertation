import { List, ListItem, Text } from "@chakra-ui/react";
import { useOffers } from "../hooks/offers";

const listOffers = (offers: string[]) => {
  return offers.map((offer, i) => {
    return (
      <ListItem key={i} fontSize={14}>
        {offer}
      </ListItem>
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
      <Text>No available offers found</Text>
  );
}
