import {
  Input,
  Stack,
  Text,
  Box,
  Button,
} from "@chakra-ui/react"
import { useState } from 'react'
import { useContractMethod } from '../hooks'

export default function ClaimCollateralForm() {
  const [orderHash, setOrderHash] = useState('')
  const handleChange = (event: any) => setOrderHash(event.target.value)
  const { send } = useContractMethod('claimCollateral')

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
        <Button isFullWidth colorScheme="purple" onClick={handleAction}>
          Claim collateral
        </Button>
      </Stack>
    </>
  );
}
