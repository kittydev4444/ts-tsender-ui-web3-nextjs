import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaGithub } from "react-icons/fa"

export default function Header() {
  return (
    <header className="flex min-w-screen justify-center bg-white/55 shadow-sm">
      <div className="flex w-full max-w-10/12 items-center justify-between py-4">
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
      </div>
    </header>
  )
}
