import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel
} from "@chakra-ui/react";
import CreateDeliveryOrderForm from "./CreateDeliveryOrderForm";
import ConfirmPickUpForm from "./ConfirmPickUpForm";
import RefuseDeliveryForm from "./RefuseDeliveryForm";
import ClaimCollateralForm from "./ClaimCollateralForm";

export default function Customer() {
  return (
    <Accordion allowToggle>
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
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
          <Box flex="1" textAlign="left">
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
          <Box flex="1" textAlign="left">
            Refuse returned delivery
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <RefuseDeliveryForm />
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            Claim collateral
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <ClaimCollateralForm />
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
  );
}
