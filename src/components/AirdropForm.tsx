"use client"
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants"
import { calculateTotal, formatTokenAmount } from "@/utils"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { useEffect, useMemo, useState } from "react"
import { CgSpinner } from "react-icons/cg"

import { RiAlertFill, RiInformationLine } from "react-icons/ri"
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import InputField from "./ui/InputField"
import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs"

type AirdropFormProps = {
  isUnsafeMode: boolean
  onModeChange: (unsafe: boolean) => void
}
export default function AirdropForm({
  isUnsafeMode,
  onModeChange,
}: AirdropFormProps) {
  const [tokenAddress, setTokenAddress] = useState(
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  )
  const [recipients, setRecipients] = useState(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  )
  const [amounts, setAmounts] = useState("1000000000000000000")
  const [hasEnoughTokens, setHasEnoughTokens] = useState(true)
  const chainId = useChainId()
  const config = useConfig()
  const { address } = useAccount()
  const { data: tokenData } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  })
  const {
    data: hash,
    isPending,
    error,
    writeContractAsync,
  } = useWriteContract()
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
  } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
  })

  const total: number = useMemo(() => calculateTotal(amounts), [amounts])

  async function getApprovedAmount(
    tSenderAddress: string | null,
  ): Promise<number> {
    if (!tSenderAddress) {
      alert("No address found, please use a supported chain")
      return 0
    }
    // read from the chain to see if we have approved enough token
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [address, tSenderAddress as `0x${string}`],
    })
    // token.allowance(account, tsender)
    return response as number
  }

  async function handleSubmit() {
    const contractType = isUnsafeMode ? "no_check" : "tsender"

    const tSenderAddress = chainsToTSender[chainId][contractType]
    const result = await getApprovedAmount(tSenderAddress)
    console.log(result)

    if (result < total) {
      const approvalHash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "approve",
        args: [tSenderAddress as `0x${string}`, BigInt(total)],
      })
      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approvalHash,
      })
      console.log("Approval confirmed", approvalReceipt)
    }

    await writeContractAsync({
      abi: tsenderAbi,
      address: tSenderAddress as `0x${string}`,
      functionName: "airdropERC20",
      args: [
        tokenAddress,
        recipients
          .split(/[,\n]+/)
          .map((addr) => addr.trim())
          .filter((addr) => addr !== ""),
        amounts
          .split(/[,\n]+/)
          .map((amt) => amt.trim())
          .filter((amt) => amt !== ""),
        BigInt(total),
      ],
    })
  }

  function getButtonContent() {
    if (isPending) {
      console.log("Pending...")
      return (
        <div className="flex w-full items-center justify-center gap-2">
          <CgSpinner className="animate-spin" size={20} />
          <span>Confirming in wallet...</span>
        </div>
      )
    }

    if (isConfirming) {
      console.log("confirming...")
      return (
        <div className="flex w-full items-center justify-center gap-2">
          <CgSpinner className="animate-spin" size={20} />
          <span>Waiting for transaction to be included...</span>
        </div>
      )
    }

    if (error || isError) {
      console.log("Error : ", error)
      return (
        <div className="flex w-full items-center justify-center gap-2">
          <span>Error, see console.</span>
        </div>
      )
    }
    if (isConfirmed) {
      console.log("confirmed")
      return "Transaction confirmed."
    }
    return isUnsafeMode ? "Send Tokens (Unsafe)" : "Send Tokens"
  }

  useEffect(() => {
    if (isConfirmed) {
      console.log("is confirmed")
      setTimeout(() => {
        alert("Transaction has been sent!")
      }, 2000)
    }
  }, [isConfirmed])

  useEffect(() => {
    if (
      tokenAddress &&
      total > 0 &&
      (tokenData?.[2]?.result as number) !== undefined
    ) {
      const userBalance = tokenData?.[2].result as number
      setHasEnoughTokens(userBalance >= total)
    } else {
      setHasEnoughTokens(true)
    }
  }, [tokenAddress, total, tokenData])

  return (
    <div
      className={`mt-5 flex h-fit w-full max-w-2xl min-w-full flex-col gap-6 rounded-xl border-2 bg-white p-6 ring-[4px] lg:mx-auto xl:min-w-lg ${isUnsafeMode ? "border-red-500 ring-red-500/25" : "border-blue-500 ring-blue-500/25"}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">T-Sender</h2>
        <Tabs defaultValue={"false"}>
          <TabsList>
            <TabsTrigger value={"false"} onClick={() => onModeChange(false)}>
              Safe Mode
            </TabsTrigger>
            <TabsTrigger value={"true"} onClick={() => onModeChange(true)}>
              Unsafe Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="space-y-4">
        <InputField
          label="Token Address"
          placeholder="0x"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <InputField
          label="Recipients"
          placeholder="0x1234,0x343553"
          value={recipients}
          large
          onChange={(e) => setRecipients(e.target.value)}
        />
        <InputField
          label="Amount"
          placeholder="100, 200, 300"
          value={amounts}
          large
          onChange={(e) => setAmounts(e.target.value)}
        />

        <div className="rounded-lg border border-zinc-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-900">
            Transaction Details
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Token Name:</span>
              <span className="font-mono text-zinc-900">
                {tokenData?.[1]?.result as string}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Amount (wei):</span>
              <span className="font-mono text-zinc-900">{total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Amount (tokens):</span>
              <span className="font-mono text-zinc-900">
                {formatTokenAmount(total, tokenData?.[0]?.result as number)}
              </span>
            </div>
          </div>
        </div>

        {isUnsafeMode && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-4 text-red-600">
            <div className="flex items-center gap-3">
              <RiAlertFill size={20} />
              <span>
                Using{" "}
                <span className="font-medium underline decoration-red-300 decoration-2 underline-offset-2">
                  unsafe
                </span>{" "}
                super gas optimized mode
              </span>
            </div>
            <div className="group relative">
              <RiInformationLine className="h-5 w-5 cursor-help opacity-45" />
              <div className="invisible absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                This mode skips certain safety checks to optimize for gas. Do
                not use this mode unless you know how to verify the calldata of
                your transaction.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 border-8 border-transparent border-t-zinc-900"></div>
              </div>
            </div>
          </div>
        )}

        <button
          className={`relative mt-4 flex w-full cursor-pointer items-center justify-center rounded-[9px] border py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400 ${
            isUnsafeMode
              ? "border-red-500 bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } ${!hasEnoughTokens && tokenAddress ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={handleSubmit}
          disabled={
            tokenAddress === "" ||
            recipients === "" ||
            amounts === "" ||
            isPending ||
            (!hasEnoughTokens && tokenAddress !== "")
          }
        >
          {isPending || error || isConfirming
            ? getButtonContent()
            : !hasEnoughTokens && tokenAddress
              ? "Insufficient token balance"
              : isUnsafeMode
                ? "Send Tokens (Unsafe)"
                : "Send Tokens"}
        </button>
      </div>
    </div>
  )
}
