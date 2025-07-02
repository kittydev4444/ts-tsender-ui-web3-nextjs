"use client"
import { useState } from "react"
import InputField from "./ui/InputField"

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")

  async function handleSubmit() {
    console.log(tokenAddress, recipients, amounts)
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
      <button onClick={handleSubmit}>Send tokens</button>
    </div>
  )
}
