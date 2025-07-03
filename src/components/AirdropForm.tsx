"use client"
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants"
import { calculateTotal } from "@/utils"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { useEffect, useMemo, useRef, useState } from "react"
import { CgSpinner } from "react-icons/cg"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import InputField from "./ui/InputField"

export default function AirdropForm() {
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
  const { address, isConnected, isDisconnected } = useAccount()
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
  const { openConnectModal } = useConnectModal()

  const [isReadyToProceed, setIsReadyToProceed] = useState(false)
  const alreadyRequestedRef = useRef(false)

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
    if (!address) {
      // only open once
      if (!alreadyRequestedRef.current) {
        alreadyRequestedRef.current = true
        openConnectModal?.()
        setIsReadyToProceed(true)
      }
      return // stop here and wait for user to connect
    }

    await proceedAfterConnection()
  }

  async function proceedAfterConnection() {
    const tSenderAddress = chainsToTSender[chainId]["tsender"]
    const approvedAmount = await getApprovedAmount(tSenderAddress)
    console.log(approvedAmount)

    if (approvedAmount < total) {
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
    // return isUnsafeMode ? "Send Tokens (Unsafe)" : "Send Tokens"
  }

  useEffect(() => {
    if (isConnected && isReadyToProceed) {
      proceedAfterConnection()
    }
  }, [isConnected, isReadyToProceed])

  useEffect(() => {
    if (isDisconnected) {
      alreadyRequestedRef.current = false
      setIsReadyToProceed(false)
    }
  }, [isDisconnected])

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
    <div className="mt-10 w-full">
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

      <button
        className={`relative mt-4 flex w-full cursor-pointer items-center justify-center rounded-[9px] border py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 ${
          // isUnsafeMode
          //   ? "border-red-500 bg-red-500 hover:bg-red-600"
          //   : "border-blue-500 bg-blue-500 hover:bg-blue-600"
          "bg-amber-200"
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
        {
          isPending || error || isConfirming
            ? getButtonContent()
            : !hasEnoughTokens && tokenAddress
              ? "Insufficient token balance"
              : "Test"
          // isUnsafeMode
          //     ? "Send Tokens (Unsafe)"
          //     : "Send Tokens"
        }
      </button>
    </div>
  )
}
