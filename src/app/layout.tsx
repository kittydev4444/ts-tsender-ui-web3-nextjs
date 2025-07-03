import Header from "@/components/Header"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "TSender",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex h-screen w-screen justify-center">
            <div className="flex w-full max-w-10/12 flex-col items-center">
              <Header />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
