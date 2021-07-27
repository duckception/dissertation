import { useContractCall } from "@usedapp/core";
import { duckExpressInterface } from "../hooks";
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from "../constants"

export function useOrder(orderHash: string) {
  const order = useContractCall({
    abi: duckExpressInterface,
    address: DUCK_EXPRESS_CONTRACT_ADDRESS,
    method: "order",
    args: [orderHash],
  }) ?? [];
  return order;
}
