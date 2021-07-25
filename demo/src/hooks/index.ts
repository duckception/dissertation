import { Contract } from "ethers";
import { useContractFunction } from "@usedapp/core";
import duckExpressJSON from "../contracts/DuckExpress.json";
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from "../constants"

const contract = new Contract(DUCK_EXPRESS_CONTRACT_ADDRESS, duckExpressJSON.abi);

export function useContractMethod(methodName: string) {
  const { state, send } = useContractFunction(contract, methodName, {});
  return { state, send };
}
