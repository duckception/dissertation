import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react'
import CreateDeliveryOrderForm from './CreateDeliveryOrderForm'
import ConfirmPickUpForm from './ConfirmPickUpForm'
import RefuseDeliveryForm from './RefuseDeliveryForm'
import ClaimCollateralForm from './ClaimCollateralForm'
import ConfirmDeliveryForm from './ConfirmDeliveryForm'

export default function Customer() {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Create delivery order
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <CreateDeliveryOrderForm />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Confirm pick up
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <ConfirmPickUpForm />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Claim collateral
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <ClaimCollateralForm />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Confirm returned delivery
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <ConfirmDeliveryForm buttonText='Confirm returned delivery' />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Refuse returned delivery
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <RefuseDeliveryForm buttonText='Refuse returned delivery' />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
