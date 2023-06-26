"use client";

import { useEffect, useState } from "react";

import {
  useContractRead,
  useContractReads,
  useContractWrite,
  useAccount,
} from "wagmi";
import { formatUnits, encodeFunctionData, parseUnits } from "viem";

import { CONTRACTS } from "@/lib/contracts";

import toast from "react-hot-toast";

function USDCYield() {
  const { address, isConnected } = useAccount();

  const [action, setAction] = useState("DEPOSIT");
  const [usdcBalance, setUsdcBalance] = useState(BigInt(0));
  const [kusdcBalance, setKusdcBalance] = useState(BigInt(0));
  const [vaultTVL, setVaultTVL] = useState(BigInt(0));
  const [vaultRatio, setVaultRatio] = useState(BigInt(0));

  const [toDeposit, setToDeposit] = useState("");
  const [toWithdraw, setToWithdraw] = useState("");

  useContractReads({
    contracts: [
      {
        address: CONTRACTS.USDCVault.address as any,
        abi: CONTRACTS.USDCVault.abi as any,
        functionName: "balance",
      },
      {
        address: CONTRACTS.USDCVault.address as any,
        abi: CONTRACTS.USDCVault.abi as any,
        functionName: "getPricePerFullShare",
      },
    ],
    watch: true,
    onSuccess(data) {
      if (data[0].status === "success") setVaultTVL(data[0].result as any);
      if (data[1].status === "success") setVaultRatio(data[1].result as any);

      console.log(data);
    },
  });

  useContractReads({
    contracts: [
      {
        address: CONTRACTS.USDC.address as any,
        abi: CONTRACTS.USDC.abi,
        functionName: "balanceOf",
        args: [address as any],
      },
      {
        address: CONTRACTS.USDCVault.address as any,
        abi: CONTRACTS.USDCVault.abi as any,
        functionName: "balanceOf",
        args: [address as any],
      },
    ],
    enabled: isConnected,
    watch: true,
    onSuccess(data) {
      if (data[0].status === "success") setUsdcBalance(data[0].result);
      if (data[1].status === "success") setKusdcBalance(data[1].result as any);
    },
  });

  const {
    data: depositTxData,
    isSuccess: depositTxSuccess,
    write: writeDepositTx,
  } = useContractWrite({
    address: CONTRACTS.Batch.address as any,
    abi: CONTRACTS.Batch.abi,
    functionName: "batchAll",
  });

  const {
    data: withdrawTxData,
    isSuccess: withdrawTxSuccess,
    write: writeWithdrawTx,
  } = useContractWrite({
    address: CONTRACTS.USDCVault.address as any,
    abi: CONTRACTS.USDCVault.abi,
    functionName: "withdraw",
  });

  const {
    data: harvestTxData,
    isSuccess: harvestTxSuccess,
    write: writeHarvestTx,
  } = useContractWrite({
    address: CONTRACTS.USDCStrategy.address as any,
    abi: CONTRACTS.USDCStrategy.abi,
    functionName: "harvest",
  });

  function onDeposit() {
    console.log("On deposit...");
    const depositAmount = parseUnits(toDeposit as any, 6);
    const approveData = encodeFunctionData({
      abi: CONTRACTS.USDC.abi,
      functionName: "approve",
      args: [CONTRACTS.USDCVault.address as any, depositAmount],
    });

    const depositData = encodeFunctionData({
      abi: CONTRACTS.USDCVault.abi,
      functionName: "deposit",
      args: [depositAmount],
    });

    writeDepositTx({
      args: [
        [CONTRACTS.USDC.address, CONTRACTS.USDCVault.address],
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
    console.log("On Harvest...");
    writeHarvestTx();
  }

  useEffect(() => {
    if (depositTxSuccess) toast.success("Deposit transaction submitted");
  }, [depositTxSuccess]);

  useEffect(() => {
    if (withdrawTxSuccess) toast.success("Withdraw transaction submitted");
  }, [withdrawTxSuccess]);

  useEffect(() => {
    if (harvestTxSuccess) toast.success("Harvest transaction submitted");
  }, [harvestTxSuccess]);

  return (
    <main className="flex-col justify-center items-center space-y-10">
      <div className="w-[400px] border shadow-sm mx-auto p-8">
        <h3 className="text-xl font-bold">How does this work?</h3>
        <p className="text-sm">
          This is a Moonwell lending only vault. It supplies the $USDC to
          Moonwell and compounds the $WELL rewards back to USDC.
        </p>
        <div className="h-[2px] w-full mt-4 bg-indigo-600" />
        <div className="mt-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-700 font-bold">TVL</p>
            <p>{Number(formatUnits(vaultTVL, 6)).toFixed(2)} $USDC</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-bold">Ratio</p>
            <p>1 $USDC = {formatUnits(vaultRatio, 18).slice(0, 6)} $kUSDC</p>
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
              <h3 className="text-lg font-bold">Deposit $USDC</h3>

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
                    setToDeposit(String(formatUnits(usdcBalance, 6)));
                  }}
                >
                  $USDC Balance: {formatUnits(usdcBalance, 6)}
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
              <h3 className="text-lg font-bold">Withdraw $USDC</h3>
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
                    setToWithdraw(String(formatUnits(kusdcBalance, 18)));
                  }}
                >
                  $kUSDC Balance: {formatUnits(kusdcBalance, 18)}
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
      <div className="w-[400px] border shadow-sm mx-auto p-8 flex justify-between items-center">
        <h3 className="text-lg font-bold">Trigger auto-compound</h3>
        <div className="">
          <button
            className="w-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={onHarvest}
          >
            Harvest
          </button>
        </div>
      </div>
    </main>
  );
}

export default USDCYield;
