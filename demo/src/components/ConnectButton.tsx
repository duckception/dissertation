import { Box, Button, Text } from '@chakra-ui/react'
import { useEtherBalance, useEthers, useTokenBalance } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import Identicon from './Identicon'
import { ERC20_TOKEN_ADDRESS } from '../constants'

export default function ConnectButton() {
  const { activateBrowserWallet, account } = useEthers()
  const etherBalance = useEtherBalance(account)
  const daiBalance = useTokenBalance(ERC20_TOKEN_ADDRESS, account)

  function handleConnectWallet() {
    activateBrowserWallet()
  }

  return account ? (
    <Box
      display='flex'
      alignItems='center'
      background='gray.700'
      borderRadius='xl'
      py='0'
    >
      <Box px='3'>
        <Text color='white' fontSize='sm'>
          {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH
        </Text>
        <Text color='white' fontSize='sm'>
          {daiBalance && parseFloat(formatEther(daiBalance)).toFixed(3)} DAI
        </Text>
      </Box>
      <Button
        bg='gray.800'
        border='1px solid transparent'
        _hover={{
          border: '1px',
          borderStyle: 'solid',
          borderColor: 'blue.400',
          backgroundColor: 'gray.700'
        }}
        borderRadius='xl'
        m='1px'
        px={3}
        height='38px'
      >
        <Text color='white' fontSize='md' fontWeight='medium' mr='2'>
          {account &&
          `${account.slice(0, 6)}...${account.slice(
            account.length - 4,
            account.length
          )}`}
        </Text>
        <Identicon />
      </Button>
    </Box>
  ) : (
    <Button
      colorScheme='purple'
      onClick={handleConnectWallet}
    >
      Connect to a wallet
    </Button>
  )
}
