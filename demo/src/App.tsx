import { ChakraProvider, Divider, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import ConnectButton from './components/ConnectButton'
import Layout from './components/Layout'
import Offers from './components/Offers'
import Order from './components/Order'
import Customer from './components/Customer'
import Offer from './components/Offer'
import Courier from './components/Courier'
import Addressee from './components/Addressee'

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
            <Tab>Check offer</Tab>
            <Tab>Check order</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Courier />
            </TabPanel>
            <TabPanel>
              <Customer />
            </TabPanel>
            <TabPanel>
              <Addressee />
            </TabPanel>
            <TabPanel>
              <Heading as='h3'>Offers</Heading>
              <Divider />
              <Offers />
            </TabPanel>
            <TabPanel>
              <p>Check the offer</p>
              <Offer />
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

export default App
