import { ChakraProvider, Tabs, TabList, Tab, TabPanels, TabPanel, Heading, Divider } from "@chakra-ui/react";
import ConnectButton from "./components/ConnectButton";
import Layout from "./components/Layout";
import Offers from "./components/Offers"
import Order from "./components/Order";
import Customer from "./components/Customer"

const App = () => {
  return (
    <ChakraProvider>
      <Layout>
        <ConnectButton />
        <Tabs>
          <TabList>
            <Tab>Courier</Tab>
            <Tab>Customer</Tab>
            <Tab>Addressee</Tab>
            <Tab>Offers</Tab>
            <Tab>Order</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <p>Courier</p>
            </TabPanel>
            <TabPanel>
              <Customer />
            </TabPanel>
            <TabPanel>
              <p>Addressee</p>
            </TabPanel>
            <TabPanel>
              <Heading as="h3">Offers</Heading>
              <Divider />
              <Offers />
            </TabPanel>
            <TabPanel>
              <p>Check the order</p>
              <Order />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layout>
    </ChakraProvider>
  )
}

export default App;
