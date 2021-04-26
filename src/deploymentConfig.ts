import { DeploymentConfig } from './models/DeploymentConfiguration'

export function createDeploymentConfig(): DeploymentConfig {
  return {
    implContractsOwner: '0xA548281203Dd3342728aAbBA793E15e474f36E02',
    duckExpressOwner: '0xA548281203Dd3342728aAbBA793E15e474f36E02',
    duckExpressProxyAdmin: '0x237fbFCEfCe1c195B601e4DeA0b8ca5aeC69678b', // mustn't be the address of account used for deployment
    duckExpressConfig: {
      minDeliveryTime: 1 * 24 * 3600,
      supportedTokens: [
        '0x3e2ee9685b71879cdd1fc1d8c890a0d8c925f80a',
      ],
    },
  }
}
