import {
  Input,
  Stack,
  Text,
  Box,
  Button,
} from "@chakra-ui/react"

export default function ConfirmPickUpForm() {
  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Text>Order hash</Text>
          <Input />
        </Box>
        <br />
        <Button isFullWidth colorScheme="purple">
          Confirm pick up
        </Button>
    </Stack>
    </>
  );
}
