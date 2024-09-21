import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";

if (
  process.env.ETH_RPC_URL === undefined ||
  process.env.ARB_RPC_URL === undefined ||
  process.env.ETH_RPC_URL === undefined ||
  // process.env.AVALANCHE_RPC_URL === undefined ||
  process.env.OPTIMISM_RPC_URL === undefined ||
  process.env.ARB_RPC_URL === undefined ||
  process.env.BASE_RPC_URL === undefined ||
  process.env.POLYGON_RPC_URL === undefined ||
  process.env.SEPOLIA_RPC_URL === undefined ||
  // process.env.AVALANCHEFUJI_RPC_URL === undefined ||
  process.env.OPTIMISMSEPOLIA_RPC_URL === undefined ||
  process.env.ARBITRUMSEPOLIA_RPC_URL === undefined ||
  process.env.BASESEPOLIA_RPC_URL === undefined ||
  process.env.POLYGONAMOY_RPC_URL === undefined
)
  throw new Error("provider env error");

function getChain(chainId: number) {
  // ethereum
  if (chainId === 1)
    return { viemChain: mainnet, rpcUrl: process.env.ETH_RPC_URL };
  // Avalanche
  if (chainId === 43114)
    return { viemChain: avalanche, rpcUrl: process.env.AVALANCHE_RPC_URL };
  // OP Mainnet
  if (chainId === 10)
    return { viemChain: optimism, rpcUrl: process.env.OPTIMISM_RPC_URL };
  // Arbitrum
  if (chainId === 42161)
    return { viemChain: arbitrum, rpcUrl: process.env.ARB_RPC_URL };
  // Base
  if (chainId === 8453)
    return { viemChain: base, rpcUrl: process.env.BASE_RPC_URL };
  // Polygon PoS
  if (chainId === 137)
    return { viemChain: polygon, rpcUrl: process.env.POLYGON_RPC_URL };
  // ethereum testnet
  if (chainId === 11155111)
    return { viemChain: sepolia, rpcUrl: process.env.SEPOLIA_RPC_URL };
  // Avalanche testnet
  if (chainId === 43113)
    return {
      viemChain: avalancheFuji,
      rpcUrl: process.env.AVALANCHEFUJI_RPC_URL,
    };
  // OP Mainnet testnet
  if (chainId === 11155420)
    return {
      viemChain: optimismSepolia,
      rpcUrl: process.env.OPTIMISMSEPOLIA_RPC_URL,
    };
  // Arbitrum testnet
  if (chainId === 421614)
    return {
      viemChain: arbitrumSepolia,
      rpcUrl: process.env.ARBITRUMSEPOLIA_RPC_URL,
    };
  // Base testnet
  if (chainId === 84532)
    return { viemChain: baseSepolia, rpcUrl: process.env.BASESEPOLIA_RPC_URL };
  // Polygon PoS testnet
  if (chainId === 80002)
    return { viemChain: polygonAmoy, rpcUrl: process.env.POLYGONAMOY_RPC_URL };
  throw new Error(`Unknown chain ${chainId}`);
}

// this object is used to cache initialised providers to avoid initialising them over and
// over each time we need to use a provider

// used to get a provider for a particular chain
export function getProviderAndWallet(chainId: number) {
  const { viemChain, rpcUrl } = getChain(chainId);

  if (rpcUrl === undefined || viemChain === undefined)
    throw new Error("Invalid createPublicClient params");

  const account = privateKeyToAccount(
    process.env.CONTROLLER_PRIVATE_KEY as Hex,
  );

  const _walletClient = createWalletClient({
    account,
    chain: viemChain,
    transport: http(rpcUrl),
  });

  const _provider = createPublicClient({
    chain: viemChain,
    transport: http(rpcUrl),
  });

  return { provider: _provider, walletClient: _walletClient };
}

if (process.env.CONTROLLER_PRIVATE_KEY === undefined)
  throw new Error("process.env.CONTROLLER_PRIVATE_KEY undefined");

export const account = privateKeyToAccount(
  process.env.CONTROLLER_PRIVATE_KEY as Hex,
);
