// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../wallet-setup/basic.setup"

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))

// Extract expect function from test
const { expect } = test

test("has title", async ({ page }) => {
  await page.goto("/")

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/)
})

test("should toggle airdrop form based on wallet connection", async ({
  page,
  context,
  metamaskPage,
  extensionId,
}) => {
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId,
  )
  const customNetwork = {
    name: "Anvil",
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337,
    symbol: "ETH",
  }

  // Go to page and check disconnected state
  await page.goto("/")
  await expect(page.getByText("Please connect")).toBeVisible()

  // Connect wallet
  await page.getByTestId("rk-connect-button").click()
  const metamaskOption = page.getByTestId("rk-wallet-option-metaMask")
  await metamaskOption.waitFor({ state: "visible", timeout: 3000 })
  await metamaskOption.click()
  await metamask.connectToDapp()
  await metamask.addNetwork(customNetwork)

  // Check connected state (form visible)
  await expect(page.getByText("Token Address")).toBeVisible()

  // Disconnect wallet
  await page.getByTestId("rk-account-button").click()
  await page.getByTestId("rk-disconnect-button").click()

  // Check form is gone
  await expect(page.getByText("Please connect")).toBeVisible()
})
