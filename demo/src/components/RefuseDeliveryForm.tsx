import { Box, Button, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useContractMethod } from '../hooks'

interface RefuseDeliveryFormProps {
  buttonText: string,
}

export default function RefuseDeliveryForm(props: RefuseDeliveryFormProps) {
  const [orderHash, setOrderHash] = useState('')
  const handleChange = (event: any) => setOrderHash(event.target.value)
  const { send } = useContractMethod('refuseDelivery')

  const handleAction = async () => {
    await send(orderHash)
  }

  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Text>Order hash</Text>
          <Input value={orderHash} onChange={handleChange} />
        </Box>
        <br />
        <Button isFullWidth colorScheme='purple' onClick={handleAction}>
          {props.buttonText}
        </Button>
      </Stack>
    </>
  )
}
