import { ChakraProvider } from "@chakra-ui/react";
import ConnectButton from "./components/ConnectButton";
import Layout from "./components/Layout";

export default function App() {
  return (
    <ChakraProvider>
      <Layout>
        <ConnectButton />
      </Layout>
    </ChakraProvider>
  )
}
