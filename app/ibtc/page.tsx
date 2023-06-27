"use client";
import {
  useContractRead,
  useContractReads,
  useContractWrite,
  useAccount,
} from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { formatUnits, encodeFunctionData, parseUnits } from "viem";

export default function Home() {
  const { address, isConnected } = useAccount();

  const {
    data: depositTxData,
    isLoading,
    isSuccess: depositTxSuccess,
    write: writeDepositTx,
  } = useContractWrite({
    address: CONTRACTS.Batch.address as any,
    abi: CONTRACTS.Batch.abi,
    functionName: "batchAll",
  });

  const {
    data: withdrawTxData,
    write: writeWithdrawTx,
    isSuccess: withdrawTxSuccess,
  } = useContractWrite({
    address: CONTRACTS.IBTCVault.address as any,
    abi: CONTRACTS.IBTCVault.abi,
    functionName: "withdraw",
  });

  const {
    data: harvestTxData,
    write: writeHarvestTx,
    isSuccess: harvestTxSuccess,
  } = useContractWrite({
    address: CONTRACTS.IBTCVault.address as any,
    abi: CONTRACTS.IBTCVault.abi,
    functionName: "convertRewards",
  });

  useEffect(() => {
    if (depositTxSuccess) toast.success("Deposit transaction submitted");
  }, [depositTxSuccess]);

  useEffect(() => {
    if (withdrawTxSuccess) toast.success("Withdraw transaction submitted");
  }, [withdrawTxSuccess]);

  useEffect(() => {
    if (harvestTxSuccess) toast.success("Harvest transaction submitted");
  }, [harvestTxSuccess]);

  const [action, setAction] = useState("DEPOSIT");

  const [btcBalance, setBtcBalance] = useState(BigInt(0));
  const [kiBTCBalance, setKIBTCBalance] = useState(BigInt(0));
  const [pendingUSDCRewards, setPendingUSDCRewards] = useState(BigInt(0));
  const [vaultTVL, setVaultTVL] = useState(BigInt(0));
  const [vaultRatio, setVaultRatio] = useState(BigInt(0));
  const [toDeposit, setToDeposit] = useState("");
  const [toWithdraw, setToWithdraw] = useState("");

  useContractReads({
    contracts: [
      {
        address: CONTRACTS.USDC.address as any,
        abi: CONTRACTS.USDC.abi as any,
        functionName: "balanceOf",
        args: [CONTRACTS.IBTCVault.address as any],
      },
      {
        address: CONTRACTS.IBTCVault.address as any,
        abi: CONTRACTS.IBTCVault.abi as any,
        functionName: "balance",
      },
      {
        address: CONTRACTS.IBTCVault.address as any,
        abi: CONTRACTS.IBTCVault.abi as any,
        functionName: "getPricePerFullShare",
      },
    ],
    watch: true,
    onSuccess(data) {
      if (data[0].status === "success")
        setPendingUSDCRewards(data[0].result as any);
      if (data[1].status === "success") setVaultTVL(data[1].result as any);
      if (data[2].status === "success") setVaultRatio(data[2].result as any);
    },
  });

  useContractReads({
    contracts: [
      {
        address: CONTRACTS.IBTC.address as any,
        abi: CONTRACTS.IBTC.abi,
        functionName: "balanceOf",
        args: [address as any],
      },
      {
        address: CONTRACTS.IBTCVault.address as any,
        abi: CONTRACTS.IBTCVault.abi as any,
        functionName: "balanceOf",
        args: [address as any],
      },
    ],
    enabled: isConnected,
    watch: true,
    onSuccess(data) {
      if (data[0].status === "success") setBtcBalance(data[0].result);
      if (data[1].status === "success") setKIBTCBalance(data[1].result as any);
    },
  });

  function onDeposit() {
    console.log("On Deposit...");
    const depositAmount = parseUnits(toDeposit as any, 8);
    const approveData = encodeFunctionData({
      abi: CONTRACTS.IBTC.abi,
      functionName: "approve",
      args: [
        CONTRACTS.IBTCVault.address as any,
        parseUnits(toDeposit as any, 8),
      ],
    });

    const depositData = encodeFunctionData({
      abi: CONTRACTS.IBTCVault.abi,
      functionName: "deposit",
      args: [depositAmount],
    });
    console.log("writing tx");

    writeDepositTx({
      args: [
        [CONTRACTS.IBTC.address, CONTRACTS.IBTCVault.address],
        [],
        [approveData, depositData],
        [],
      ],
    });
  }

  function onWithdraw() {
    console.log("On withdraw...");
    const withdrawAmount = parseUnits(toWithdraw as any, 18);
    console.log(withdrawAmount);
    writeWithdrawTx({
      args: [withdrawAmount],
    });
  }

  function onHarvest() {
    console.log("On harvest..");
    writeHarvestTx();
  }

  return (
    <main className="flex-col justify-center items-center space-y-10">
      <div className="w-[400px] border shadow-sm mx-auto p-8">
        <h3 className="text-xl font-bold">How does this work?</h3>
        <p className="text-sm">
          The $iBTC vault offers <b>risk-free yield</b> sourced from the other
          tranches.
          <br />
          <br />
          From the Moonwell lending vaults, 10% of the $WELL rewards converted
          to USDC are sent to the $iBTC vault.
        </p>
        <div className="h-[2px] w-full mt-2 bg-indigo-600" />
        <div className="mt-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-700 font-bold">TVL</p>
            <p>{Number(formatUnits(vaultTVL, 8)).toFixed(5)} $iBTC</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-bold">Ratio</p>
            <p>
              1 $iBTC = {Number(formatUnits(vaultRatio, 18)).toFixed(2)} $kiBTC
            </p>
          </div>
        </div>
      </div>
      {/* VAULT BOX */}
      <div className="w-[400px] border shadow-sm mx-auto">
        <div className="flex justify-between border-b text-sm">
          <button
            className={`w-1/2 px-2 py-4 font-bold  ${
              action === "DEPOSIT" &&
              "bg-indigo-600 text-white shadow-md ring-inset ring-2 ring-indigo-300"
            }`}
            onClick={() => setAction("DEPOSIT")}
          >
            DEPOSIT
          </button>
          <button
            className={`w-1/2 px-2 py-4 font-bold  ${
              action === "WITHDRAW" &&
              "bg-indigo-600 text-white shadow-md ring-inset ring-2 ring-indigo-300"
            }`}
            onClick={() => setAction("WITHDRAW")}
          >
            WITHDRAW
          </button>
        </div>
        <div className="p-8">
          {action === "DEPOSIT" ? (
            <>
              <h3 className="text-lg font-bold">Deposit $iBTC</h3>

              <form
                className="mt-10"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("form submitted");
                  onDeposit();
                }}
              >
                <button
                  className="text-xs underline float-right mb-1"
                  type="button"
                  onClick={() => {
                    setToDeposit(String(formatUnits(btcBalance, 8)));
                  }}
                >
                  $iBTC Balance: {formatUnits(btcBalance, 8)}
                </button>
                <input
                  className="block w-full border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                  placeholder="$0.00"
                  value={toDeposit}
                  onChange={(e) => setToDeposit(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Deposit
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold">Withdraw $iBTC</h3>
              <form
                className="mt-10"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("form submitted");
                  onWithdraw();
                }}
              >
                <button
                  className="text-xs underline float-right mb-1"
                  type="button"
                  onClick={() => {
                    setToWithdraw(String(formatUnits(kiBTCBalance, 18)));
                  }}
                >
                  $kiBTC Balance: {formatUnits(kiBTCBalance, 18)}
                </button>
                <input
                  className="block w-full border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                  placeholder="$0.00"
                  value={toWithdraw}
                  onChange={(e) => setToWithdraw(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Withdraw
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="w-[400px] border shadow-sm mx-auto p-8">
        <h3 className="text-lg font-bold">Trigger auto-compound</h3>
        {pendingUSDCRewards < BigInt(1e6) && (
          <p className="text-red-600 text-sm mt-1">
            Compound only when pending rewards more than 1 USDC
          </p>
        )}

        <div className="flex justify-between items-center mt-6">
          <div className="">
            <p className="text-xs uppercase text-gray-500 font-bold">
              USDC Rewards
            </p>
            <p>{formatUnits(pendingUSDCRewards, 6)}</p>
          </div>
          <button
            disabled={pendingUSDCRewards < BigInt(1e6)}
            className={`w-1/4 bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              pendingUSDCRewards < BigInt(1e6) && "bg-indigo-400"
            }`}
            onClick={onHarvest}
          >
            Harvest
          </button>
        </div>
      </div>
    </main>
  );
}
