import { useContractCall } from "@usedapp/core";
import { duckExpressInterface } from ".";
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from "../constants"

export function useOffers() {
  const offers: string[] = useContractCall({
    abi: duckExpressInterface,
    address: DUCK_EXPRESS_CONTRACT_ADDRESS,
    method: "offers",
    args: [],
  }) ?? [];
  return offers;
}
