import { Box, Button, Input, NumberInput, NumberInputField, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Offer } from '../models/offer'
import { BigNumber, utils } from 'ethers'
import { useContractMethod } from '../hooks'

export default function CreateDeliveryOrderForm() {
  const [offer, setOffer] = useState<Offer>(Object)
  const { send } = useContractMethod('createDeliveryOffer')

  const handleOffer = (attribute: string, value: any) => {
    const newOffer = offer
    // @ts-ignore
    newOffer[attribute] = value
    setOffer(newOffer)
  }

  const handleCreate = async () => {
    await send(offer)
  }

  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Text>Nonce</Text>
          <NumberInput
            min={0}
            onChange={(value: string) => {
              if (value !== '') {
                handleOffer('nonce', BigNumber.from(value))
              }
            }}
          >
            <NumberInputField />
          </NumberInput>
        </Box>
        <Box>
          <Text>Customer's Ethereum address</Text>
          <Input onChange={(e: any) => handleOffer('customerAddress', e.target.value)} />
        </Box>
        <Box>
          <Text>Addressee's Ethereum address</Text>
          <Input onChange={(e: any) => handleOffer('addresseeAddress', e.target.value)} />
        </Box>
        <Box>
          <Text>Physical pick up address</Text>
          <Input onChange={(e: any) => handleOffer('pickupAddress', utils.formatBytes32String(e.target.value))} />
        </Box>
        <Box>
          <Text>Physical delivery address</Text>
          <Input onChange={(e: any) => handleOffer('deliveryAddress', utils.formatBytes32String(e.target.value))} />
        </Box>
        <Box>
          <Text>Maximum delivery time (in days)</Text>
          <Input onChange={(e: any) => {
            if (e.target.value !== '') {
              handleOffer('deliveryTime', BigNumber.from(parseInt(e.target.value) * 24 * 3600))
            }
          }} />
        </Box>
        <Box>
          <Text>Token address</Text>
          <Input onChange={(e: any) => handleOffer('tokenAddress', e.target.value)} />
        </Box>
        <Box>
          <Text>Reward (in tokens)</Text>
          <Input onChange={(e: any) => {
            if (e.target.value !== '') {
              handleOffer('reward', utils.parseEther(e.target.value))
            }
          }} />
        </Box>
        <Box>
          <Text>Collateral (in tokens)</Text>
          <Input onChange={(e: any) => {
            if (e.target.value !== '') {
              handleOffer('collateral', utils.parseEther(e.target.value))
            }
          }} />
        </Box>
        <br />
        <Button isFullWidth colorScheme='purple' onClick={handleCreate}>
          Create delivery order
        </Button>
      </Stack>
    </>
  )
}
