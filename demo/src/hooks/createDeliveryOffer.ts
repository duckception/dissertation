import { useContractMethod } from './index'

export function useCreateDeliveryOffer() {
  const { state, send } = useContractMethod("createDeliveryOffer");
  return { state, send };
}
