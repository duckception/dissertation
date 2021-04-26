import { readFileSync } from 'fs'
import { getDefaultProvider, Wallet } from 'ethers'
import { createDeploymentConfig } from './deploymentConfig'
import { deployDuckExpressContracts } from './deployDuckExpressContracts'

async function run(args: string[]) {
  if (args.length !== 1) {
    throw new Error('Invalid number of arguments')
  }

  const secretsFile = readFileSync(args[0], 'utf8')
  const secrets = JSON.parse(secretsFile)
  const provider = getDefaultProvider('rinkeby')
  const wallet = new Wallet(secrets.privateKey, provider)
  const config = createDeploymentConfig()
  await deployDuckExpressContracts(wallet, config)
}

run(process.argv.slice(2))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
