"use client";

import { useAccount, useContractReads } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { useEffect } from "react";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Yield engine public good on Moonbeam.
      </h1>

      <h3 className="text-2xl font-semibold mt-10">
        Risk-free yield for $iBTC
      </h3>
      <p className="mt-2">
        Earn yield on your $iBTC funded from the protocol&apos;s usage. <br />
        The Moonwell Lending vaults for other assets donate 10% of their yield
        for $iBTC.
        <br />
        <b>
          The $iBTC is NOT deposited in any other protocol -- the yield is
          native to MYield.
        </b>
      </p>
      <h3 className="text-2xl font-semibold mt-10">Moonwell Lending Vaults</h3>

      <p className="mt-2">
        Vaults that auto-compound your rewards for supplying assets in the
        Moonwell protocol. Currently, USDC supported.
      </p>
      <h3 className="text-2xl font-semibold mt-10">Seamless Experience</h3>
      <p className="mt-2">
        We make it easy for you. No need to sign two transactions for approve &
        deposit.
        <br />
        It&apos;s magic. We <b>batch your transactions</b> using Moonbeam&apos;s
        Batch pre-compile for <b>one-click deposits</b>.
      </p>
    </div>
  );
}
