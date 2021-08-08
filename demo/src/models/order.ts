import { Offer } from "./offer";

export interface Order {
  offer: Offer
  status: number
  courierAddress: string
  creationTimestamp: string
  lastUpdateTimestamp: string
}
