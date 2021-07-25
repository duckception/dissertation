import React from "react";
import ReactDOM from "react-dom";
import App from "./App"
import { ChainId, DAppProvider, Config } from '@usedapp/core'
import { INFURA_API_KEY } from './constants'

const config: Config = {
  readOnlyChainId: ChainId.Rinkeby,
  readOnlyUrls: {
    [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
