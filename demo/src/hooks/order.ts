import { useContractCall } from '@usedapp/core'
import { duckExpressInterface } from './index'
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from '../constants'

export function useOrder(orderHash: string) {
  return useContractCall({
    abi: duckExpressInterface,
    address: DUCK_EXPRESS_CONTRACT_ADDRESS,
    method: 'order',
    args: [orderHash]
  }) ?? []
}
