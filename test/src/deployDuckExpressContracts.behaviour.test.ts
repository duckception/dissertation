import { expect } from 'chai'
import { MockProvider } from 'ethereum-waffle'
import { DuckExpress, DuckExpress__factory } from '../../build'
import { deployDuckExpressContracts } from '../../src/deployDuckExpressContracts'
import { DeploymentConfig } from '../../src/models/DeploymentConfiguration'
import { randomAddress } from '../helpers/randomAddress'
import DuckExpressJSON from '../../build/DuckExpress.json'
import ProxyJSON from '../../build/TransparentUpgradeableProxy.json'

describe('deployDuckExpressContracts', () => {
  const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'

  const provider = new MockProvider()
  const [
    deployer,
    implContractsOwner,
    duckExpressOwner,
    duckExpressProxyAdmin,
    other,
  ] = provider.getWallets()
  const deploymentConfig: DeploymentConfig = {
    implContractsOwner: implContractsOwner.address,
    duckExpressOwner: duckExpressOwner.address,
    duckExpressProxyAdmin: duckExpressProxyAdmin.address,
    duckExpressConfig: {
      minDeliveryTime: 1 * 24 * 3600,
      supportedTokens: [
        randomAddress(),
        randomAddress(),
        randomAddress(),
      ],
    },
  }

  let duckExpressImplAddress: string
  let duckExpressProxyAddress: string
  let duckExpress: DuckExpress

  beforeEach(async () => {
    ({
      duckExpressImplAddress,
      duckExpressProxyAddress,
    } = await deployDuckExpressContracts(deployer, deploymentConfig))
    duckExpress = DuckExpress__factory.connect(duckExpressProxyAddress, implContractsOwner)
  })

  it('deploys implementation correctly', async () => {
    expect(await provider.getCode(duckExpressImplAddress)).to.eq('0x' + DuckExpressJSON.evm.deployedBytecode.object)
  })

  it('deploys proxy correctly', async () => {
    expect(await provider.getCode(duckExpressProxyAddress)).to.eq('0x' + ProxyJSON.evm.deployedBytecode.object)
  })

  it('sets correct implementation owner', async () => {
    const duckExpressImpl = DuckExpress__factory.connect(duckExpressImplAddress, other)
    expect(await duckExpressImpl.owner()).to.eq(deploymentConfig.implContractsOwner)
  })

  it('sets correct owner', async () => {
    expect(await duckExpress.owner()).to.eq(deploymentConfig.duckExpressOwner)
  })

  it('sets correct proxy admin', async () => {
    const proxyAdmin = await provider.getStorageAt(duckExpressProxyAddress, ADMIN_SLOT, 'latest')
    expect(proxyAdmin.toUpperCase()).to.eq(deploymentConfig.duckExpressProxyAdmin.toUpperCase())
  })

  it('sets correct minimum delivery time', async () => {
    expect(await duckExpress.minDeliveryTime()).to.eq(deploymentConfig.duckExpressConfig.minDeliveryTime)
  })

  it('supports correct tokens', async () => {
    for (const token of deploymentConfig.duckExpressConfig.supportedTokens) {
      expect(await duckExpress.isTokenSupported(token)).to.be.true
    }
  })
})
