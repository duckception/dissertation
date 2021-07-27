import { useContractCall } from "@usedapp/core";
import { duckExpressInterface } from ".";
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from "../constants"

export interface OffersOffer {
  offerHash: string
  offerStatus: number
}

export function useOffers() {
  const rawOffers = useContractCall({
    abi: duckExpressInterface,
    address: DUCK_EXPRESS_CONTRACT_ADDRESS,
    method: "offers",
    args: [],
  }) ?? [];

  const offers: OffersOffer[] = []

  for (let i = 0; i < rawOffers.length; i++) {
    const element = rawOffers[i][0];

    offers.push({
      offerHash: element[0],
      offerStatus: element[1]
    })
  }
  
  return offers;
}
