import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

export const ConnectToWallet = () => {
  return (
    <div className='overflow-hidden'>
      <motion.section
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >

        <motion.h1
          className="text-3xl md:text-4xl font-extrabold mb-4 text-center text-gray-100 drop-shadow-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.47, ease: 'easeOut' }}
        >
          Welcome to <span className="text-blue-700">Ledger Vote</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-10 text-center text-gray-200 max-w-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45, ease: 'easeOut' }}
        >
          The <span className="font-semibold text-blue-600">decentralized voting platform</span>.<br />
          Please connect your wallet to get started.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.35 }}
        >
          <ConnectButton />
        </motion.div>
      </motion.section>
    </div>
  );
};
