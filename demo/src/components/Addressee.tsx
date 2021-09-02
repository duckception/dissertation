import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react'
import ConfirmDeliveryForm from './ConfirmDeliveryForm'
import RefuseDeliveryForm from './RefuseDeliveryForm'

export default function Addressee() {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Confirm delivery
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <ConfirmDeliveryForm buttonText='Confirm delivery' />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Refuse delivery
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <RefuseDeliveryForm buttonText='Refuse delivery' />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
