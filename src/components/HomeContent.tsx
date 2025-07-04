"use client"

import AirdropForm from "@/components/AirdropForm"
import { useState } from "react"
import { useAccount } from "wagmi"

export default function HomeContent() {
  const [isUnsafeMode, setIsUnsafeMode] = useState(false)
  const { isConnected } = useAccount()

  return (
    <main className="flex h-10/12 w-full justify-center">
      {!isConnected ? (
        <div className="flex items-center justify-center">
          <h2 className="text-xl font-medium text-zinc-600">
            Please connect a wallet...
          </h2>
        </div>
      ) : (
        <AirdropForm
          isUnsafeMode={isUnsafeMode}
          onModeChange={setIsUnsafeMode}
        />
      )}
    </main>
  )
}
