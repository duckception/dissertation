interface DuckExpressConfig {
  minDeliveryTime: number,
  supportedTokens: string[],
}

export interface DeploymentConfig {
  implContractsOwner: string,
  duckExpressOwner: string,
  duckExpressProxyAdmin: string,
  duckExpressConfig: DuckExpressConfig,
}
