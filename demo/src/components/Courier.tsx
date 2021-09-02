import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react'
import AcceptDeliveryOfferForm from './AcceptDeliveryOfferForm'

export default function Courier() {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              Accept delivery order
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <AcceptDeliveryOfferForm />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
