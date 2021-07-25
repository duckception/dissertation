import { List, ListItem } from "@chakra-ui/react";
import { useOffers } from "../hooks";

const listOffers = (offers: string[]) => {
  return offers.map((offer, i) => {
    return (
      <ListItem key={i} color="white" fontSize={14}>
        {offer}
      </ListItem>
    )
  })
}

export default function Offers() {
  const offers = useOffers();
  return (
    <List spacing={3}>
      {listOffers(offers)}
    </List>
  );
}
