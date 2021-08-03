import {
  NumberInput,
  NumberInputField,
  Input,
  Stack,
  Text,
  Box,
  Button,
} from "@chakra-ui/react"

export default function CreateDeliveryOrderForm() {
  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Text>Nonce</Text>
          <NumberInput min={0}>
            <NumberInputField />
          </NumberInput>
        </Box>
        <Box>
          <Text>Addressee's Ethereum address</Text>
          <Input />
        </Box>
        <Box>
          <Text>Physical pick up address</Text>
          <Input />
        </Box>
        <Box>
          <Text>Physical delivery address</Text>
          <Input />
        </Box>
        <Box>
          <Text>Maximum delivery time (in days)</Text>
          <Input />
        </Box>
        <Box>
          <Text>Token address</Text>
          <Input />
        </Box>
        <Box>
          <Text>Reward (in tokens)</Text>
          <Input />
        </Box>
        <Box>
          <Text>Collateral (in tokens)</Text>
          <Input />
        </Box>
        <br />
        <Button isFullWidth colorScheme="purple">
          Create delivery order
        </Button>
    </Stack>
    </>
  );
}
