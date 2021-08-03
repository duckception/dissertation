import { Input } from "@chakra-ui/react";
import { useState } from "react";
import { useOrder } from "../hooks/order";
import OrderItem from "./OrderItem"

export default function Order() {
  const [orderHash, setOrderHash] = useState("")
  const handleChange = (event: any) => setOrderHash(event.target.value)
  const order = useOrder(orderHash)

  return (
    <>
      <Input
        value={orderHash}
        onChange={handleChange}
        placeholder="Type in the order hash here..."
      />
      <br /><br />
      {order.length > 0 ?
        <OrderItem order={order[0]} />
      : <></>}
    </>
  );
}
