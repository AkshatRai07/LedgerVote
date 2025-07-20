'use client';

import { ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "Ledger Vote",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
