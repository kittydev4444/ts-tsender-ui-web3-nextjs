import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaGithub } from "react-icons/fa"

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
      <div className="flex space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">TSender</h1>

        <a
          href="https://github.com/kittydev4444/ts-tsender-ui-web3-nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
        >
          <FaGithub size={24} />
        </a>
      </div>

      <div>
        <ConnectButton />
      </div>
    </header>
  )
}
