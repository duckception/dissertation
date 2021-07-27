import { Text } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";

interface Offer {
  nonce: BigNumber,
  customerAddress: string,
  addresseeAddress: string,
  pickupAddress: string,
  deliveryAddress: string,
  deliveryTime: BigNumber,
  tokenAddress: string,
  reward: BigNumber,
  collateral: BigNumber,
}

interface Order {
  offer: Offer
  status: number
  courierAddress: string
  creationTimestamp: string
  lastUpdateTimestamp: string
}

interface OrderItemProps {
  order: Order
}

function parseOrderStatus(status: number) {
  const statuses = [
    "AWAITING_PICK_UP",
    "PICKED_UP",
    "DELIVERED",
    "DELIVERED_LATE",
    "REFUSED",
    "FAILED",
    "CLAIMED",
    "RETURNED"
  ]

  return statuses[status]
}

//0x4c549ccc8b2bc2401083fd160e8ec416c457ed3b70396ed3170ca1bf775e8e87
export default function OrderItem(props: OrderItemProps) {
  const offer = props.order.offer
  const order = props.order
  const creationTime = new Date()
  creationTime.setTime(parseInt(order.creationTimestamp) * 1000)
  const lastUpdateTime = new Date()
  lastUpdateTime.setTime(parseInt(order.lastUpdateTimestamp) * 1000)
  return (
    <>
      <Text><b>Status:</b> {parseOrderStatus(order.status)}</Text>
      <Text><b>Courier address:</b> {order.courierAddress}</Text>
      <Text><b>Creation time:</b> {creationTime.toLocaleString()}</Text>
      <Text><b>Last updated:</b> {lastUpdateTime.toLocaleString()}</Text>
      <Text><b>Nonce:</b> {offer.nonce.toString()}</Text>
      <Text><b>Customer address:</b> {offer.customerAddress}</Text>
      <Text><b>Addressee address:</b> {offer.addresseeAddress}</Text>
      <Text><b>Pickup address:</b> {utils.parseBytes32String(offer.pickupAddress)}</Text>
      <Text><b>Delivery address:</b> {utils.parseBytes32String(offer.deliveryAddress)}</Text>
      <Text><b>Delivery time: </b> {offer.deliveryTime.toNumber() / 3600}h</Text>
      <Text><b>Token address: </b> {offer.tokenAddress}</Text>
      <Text><b>Reward: </b> {utils.formatEther(offer.reward)} tokens</Text>
      <Text><b>Collateral: </b> {utils.formatEther(offer.collateral)} tokens</Text>
    </>
  );
}
