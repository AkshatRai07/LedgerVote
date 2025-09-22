"use client";

import { getProposalHash, proposalOnChain, proposalOnMongo } from '@/components/createProposal/index';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'

const CreateProposal = () => {

  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [expiry, setExpiry] = useState<string>('');
  const [minValueToVote, setMinValueToVote] = useState("0.005");
  const [minExpiry, setMinExpiry] = useState('');
  const { address } = useAccount();
  const router = useRouter();

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const handleOptionChange = (idx:number, value:string) => {
    const newOptions = [...options]
    newOptions[idx] = value
    if (idx === options.length - 1 && value.trim() !== '') {
      newOptions.push('')
    }
    setOptions(newOptions)
  }

  const handleProposalSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (title === '') {
      setError('Please enter title first')
    }

    const filledOptions = options.filter(opt => opt.trim().length > 0)
    if (filledOptions.length < 2) {
      setError('Please enter at least 2 options.')
      return
    }
    setError('')

    if (!address) {
      // User must get here only after wallet connection, added to remove ts errors
      return;
    }

    let expiryInt : bigint;

    if (!expiry) {
      expiryInt = BigInt(Math.floor(Date.now()/1000) + 7 * 24 * 3600);
    } else {
      expiryInt = BigInt(Math.floor(new Date(expiry).getTime() / 1000));
    }

    const proposalHash = getProposalHash(address, expiryInt, title, options)

    try {
      const { createdAt } = await proposalOnChain({expiryInt, minValueToVote, proposalHash, writeContractAsync, publicClient});

      await proposalOnMongo({
        proposalCreator: address,
        proposalCreatedAt: createdAt ? new Date(Number(createdAt) * 1000) : new Date(),
        proposalExpiry: new Date(Number(expiryInt) * 1000),
        proposalTitle: title,
        proposalOptions: filledOptions,
        proposalHash,
      });

      alert(`Proposal Created!\nTitle: ${title}`);
      setTitle("");
      setOptions(['','']);
      router.push("/");

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Failed to submit proposal.");
      } else {
        setError("Failed to submit proposal.");
      }
    }
  }

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setMinExpiry(now);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center w-full bg-gradient-to-br from-slate-900 to-purple-900">
      <header className="flex items-center justify-between px-6 py-4 w-full bg-slate-900 shadow-2xl/10 shadow-neutral-50">
        <Link href="/">
          <span className="font-bold text-xl text-blue-700">Ledger Vote</span>
        </Link>
        <ConnectButton />
      </header>

      <div className="w-[60vw] flex flex-col my-12">
        <form className="flex flex-col gap-6" onSubmit={handleProposalSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-neutral-300">Title</label>
            <input
              className="create-proposal-form-style"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter proposal title"
              required
            />
          </div>

          <div className="flex flex-col gap-2 text-neutral-300">
            <label className="font-semibold">Options</label>
            {options.map((opt, idx) => (
              <input
                key={idx}
                className="create-proposal-form-style"
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 text-neutral-300">
            <label className="font-semibold">Expiry</label>
            <input
              type="datetime-local"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="create-proposal-form-style"
              min={minExpiry} // no past date
            />
            <span className="text-gray-500 text-xs">Leave blank for 1 week expiry</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Minimum value to vote</label>
            <input
              className="create-proposal-form-style"
              value={minValueToVote}
              onChange={e => setMinValueToVote(e.target.value)}
              placeholder="Enter minimum value to vote"
              required
            />
            <span className="text-gray-500 text-xs">Leave untouched to let 0.005 ETH as default minimum value to vote</span>
          </div>

          {error && <div className="text-red-600">{error}</div>}
          <button
            className="bg-blue-700 text-white border-none w-fit rounded-4xl px-3 py-3 focus:outline-none shadow-md shadow-gray-200 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:cursor-pointer active:scale-95"
            type="submit"
            disabled={title.trim().length === 0}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProposal
