import { ethers } from "ethers";
import { useContractCall } from "@usedapp/core";
import duckExpressJSON from "../contracts/DuckExpress.json";
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from "../constants"

const duckExpressInterface = new ethers.utils.Interface(duckExpressJSON.abi);

export function useOffers() {
  const offers: string[] = useContractCall({
    abi: duckExpressInterface,
    address: DUCK_EXPRESS_CONTRACT_ADDRESS,
    method: "offers",
    args: [],
  }) ?? [];
  return offers;
}
