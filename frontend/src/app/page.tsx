"use client";

import { ConnectToWallet } from '@/components/homePage/ConnectToWallet';
import HomePage from '@/components/homePage/HomePage';
import { useAccount } from 'wagmi';

export default function Home() {

  const { isConnected } = useAccount();

  if (!isConnected) {
    return <ConnectToWallet />
  }
  else {
    return <HomePage />
  }

}
