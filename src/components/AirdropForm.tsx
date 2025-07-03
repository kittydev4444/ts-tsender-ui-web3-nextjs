"use client"
import { chainsToTSender, erc20Abi } from "@/constants"
import { calculateTotal } from "@/utils/calculateTotal/calculateTotal"
import { readContract } from "@wagmi/core"
import { useMemo, useState } from "react"
import { useAccount, useChainId, useConfig } from "wagmi"
import InputField from "./ui/InputField"

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")
  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()

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
      args: [account.address, tSenderAddress as `0x${string}`],
    })
    // token.allowance(account, tsender)
    return response as number
  }

  async function handleSubmit() {
    // 1a. If already approved, moved to step 2
    // 1b. Approve our tsender contract to send our tokens
    // 2. Call the airdrop function on the tsender contract
    // 3. Wait for the transaction to be mined
    const tSenderAddress = chainsToTSender[chainId]["tsender"]
    const approvedAmount = await getApprovedAmount(tSenderAddress)
    console.log(approvedAmount)

    // if (result < totalAmountNeeded)
  }

  return (
    <div>
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
        onClick={handleSubmit}
        className="mt-4 transform rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        Send tokens
      </button>
    </div>
  )
}
