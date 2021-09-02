import { Contract, ethers } from 'ethers'
import { useContractFunction } from '@usedapp/core'
import { DUCK_EXPRESS_CONTRACT_ADDRESS } from '../constants'
import duckExpressJSON from '../contracts/DuckExpress.json'

const duckExpressInterface = new ethers.utils.Interface(duckExpressJSON.abi)

const contract = new Contract(DUCK_EXPRESS_CONTRACT_ADDRESS, duckExpressJSON.abi)

export function useContractMethod(methodName: string) {
  const { state, send } = useContractFunction(contract, methodName, {})
  return { state, send }
}

export { duckExpressInterface }
