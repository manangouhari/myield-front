import IBTCVaultABI from "@/contracts/ibtc-vault.json";
import BatchABI from "@/contracts/batch.json";
import USDCVaultABI from "@/contracts/yield-vault.json";
import USDCStrategyABI from "@/contracts/strategy.json";

import { erc20ABI } from "wagmi";

export const CONTRACTS = {
  Batch: {
    address: "0x0000000000000000000000000000000000000808",
    abi: BatchABI,
  },
  IBTCVault: {
    address: "0x071502a7a8673a8Cc1f2Fec9B4f7dc6b99B78a2D",
    abi: IBTCVaultABI,
  },
  IBTC: {
    address: "0xFFFFFfFf5AC1f9A51A93F5C527385edF7Fe98A52",
    abi: erc20ABI,
  },
  USDCVault: {
    address: "0x61E8780c9Eb961c4b54a83BeCAA1B34A58b708f0",
    abi: USDCVaultABI,
  },
  USDCStrategy: {
    address: "0x7daaC7C109cF2d3bC811CFf1B5801e412ab5A116",
    abi: USDCStrategyABI,
  },
  USDC: {
    address: "0x931715fee2d06333043d11f658c8ce934ac61d0c",
    abi: erc20ABI,
  },
};
