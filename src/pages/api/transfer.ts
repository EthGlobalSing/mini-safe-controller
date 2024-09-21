// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { get } from "@vercel/edge-config";
import { Address } from "viem";
import { account, getProviderAndWallet } from "@/provider";

type Users = {
  telegramId: 1234;
  address: "0x1234";
  chainId: 10;
}[];

type Party = {
  address?: Address;
  telegramId?: number;
  chainId: number;
};

type Body = {
  from: Party;
  to: Party;
  token: Address;
  amount: string;
};

const moduleAbi = [
  {
    type: "function",
    name: "executeAllowanceTransfer",
    inputs: [
      { name: "safe", type: "address", internalType: "contract ISafe" },
      { name: "token", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address payable" },
      { name: "amount", type: "uint96", internalType: "uint96" },
      { name: "delegate", type: "address", internalType: "address" },
      { name: "chain", type: "uint8", internalType: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const chainIdToCctp: { [key: number]: number } = {
  // MAINNET
  1: 0, // ethereum
  43114: 1, // Avalanche
  10: 2, // OP Mainnet
  42161: 3, // Arbitrum
  8453: 6, // Base
  137: 7, // Polygon PoS

  // TESTNET
  11155111: 0, // ethereum testnet
  43113: 1, // Avalanche testnet
  11155420: 2, // OP Mainnet testnet
  421614: 3, // Arbitrum testnet
  84532: 6, // Base testnet
  80002: 7, // Polygon PoS testnet
};

type Data = {
  status: string;
};

function extractAddress(party: Party, users: Users): Address {
  if (party.address !== undefined) return party.address;
  const _user = users.find((u) => u.telegramId === party.telegramId);
  if (_user) return _user.address;
  throw new Error("Unknown user");
}

// MODIFY
const config = {
  miniSafeModule: "0x4BfeB254D4018C8a8E9E7BD7A75994C74060fAD3" as Address,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    return res.status(400).end("Bad Request");
  }

  const _body = req.body as Body;

  // TODO verify that the transfer request is legitimate

  const users = (await get("users")) as Users;

  const from = extractAddress(_body.from, users);
  const to = extractAddress(_body.from, users);

  const { provider, walletClient } = getProviderAndWallet(_body.from.chainId);

  const { request } = await provider.simulateContract({
    account: account,
    address: config.miniSafeModule,
    abi: moduleAbi,
    functionName: "executeAllowanceTransfer",
    args: [
      from,
      _body.token,
      to,
      BigInt(_body.amount),
      account.address,
      chainIdToCctp[_body.to.chainId],
    ],
  });
  await walletClient.writeContract(request);

  console.log("transaction sent");

  res.status(200).json({ status: "success" });
}
