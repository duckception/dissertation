import { ChakraProvider } from "@chakra-ui/react";
import ConnectButton from "./components/ConnectButton";
import Layout from "./components/Layout";
import Offers from "./components/Offers"

export default function App() {
  return (
    <ChakraProvider>
      <Layout>
        <ConnectButton />
        <Offers />
      </Layout>
    </ChakraProvider>
  )
}
