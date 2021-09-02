import { Input } from '@chakra-ui/react'
import { useState } from 'react'
import { useOffer } from '../hooks/offer'
import OfferItem from './OfferItem'

export default function Offer() {
  const [offerHash, setOfferHash] = useState('')
  const handleChange = (event: any) => setOfferHash(event.target.value)
  const offer = useOffer(offerHash)

  return (
    <>
      <Input
        value={offerHash}
        onChange={handleChange}
        placeholder='Type in the order hash here...'
      />
      <br /><br />
      {offer.length > 0 ?
        <OfferItem offer={offer[0]} />
        : <></>}
    </>
  )
}
