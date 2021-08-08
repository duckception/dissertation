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

  if (rawOffers.length !== 1) {
    return []
  }

  const offers: OffersOffer[] = []

  for (let i = 0; i < rawOffers[0].length; i++) {
    const element = rawOffers[0][i];

    offers.push({
      offerHash: element[0],
      offerStatus: element[1]
    })
  }

  return offers;
}
