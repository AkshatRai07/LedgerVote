'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import ProposalHandler from './ProposalHandler';
import ProposalCard from './ProposalCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Proposal = {
  _id : string;
  proposalCreator : string;
  proposalCreatedAt : Date;
  proposalExpiry : Date;
  proposalTitle : string;
  proposalOptions : string[];
  proposalHash : string;
};

const HomePage = () => {
  const [creator, setCreator] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'proposalCreatedAt' | 'proposalExpiry'>('proposalCreatedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      setLoading(true);
      setError(null);
      try {
        let url: string;
        if (creator.trim()) {
          url = `${API_URL}/proposals/creator/${creator}?sortBy=${sortBy}&order=${order}`;
        } else if (filter === 'active') {
          url = `${API_URL}/proposals/active?sortBy=${sortBy}&order=${order}`;
        } else if (filter === 'expired') {
          url = `${API_URL}/proposals/expired?sortBy=${sortBy}&order=${order}`;
        } else {
          url = `${API_URL}/proposals?sortBy=${sortBy}&order=${order}`;
        }
        const r = await fetch(url);
        if (!r.ok) throw new Error('Error loading proposals');
        setProposals(await r.json());
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err?.message);
        }
        else {
          setError("Unknown error has occures")
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, [creator, filter, sortBy, order]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 shadow-2xl/10 shadow-neutral-50">
        <span className="font-bold text-xl text-blue-600">Ledger Vote</span>
        <ConnectButton />
      </header>

      <div className="flex justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 mt-6 mb-2 px-6">
          <input
            className="select-style w-full md:w-72"
            type="text"
            placeholder="Enter creator address"
            value={creator}
            onChange={e => setCreator(e.target.value)}
          />

          <select className="select-style" value={filter} onChange={e => setFilter(e.target.value as 'all' | 'active' | 'expired')}>
            <option className="select-style" value="all">All Proposals</option>
            <option className="select-style" value="active">Active Only</option>
            <option className="select-style" value="expired">Expired Only</option>
          </select>

          <select className="select-style" value={sortBy} onChange={e => setSortBy(e.target.value as 'proposalCreatedAt' | 'proposalExpiry')}>
            <option className="select-style" value="proposalCreatedAt">Sort by Created Time</option>
            <option className="select-style" value="proposalExpiry">Sort by Expiry</option>
          </select>

          <select className="select-style" value={order} onChange={e => setOrder(e.target.value as 'asc' | 'desc')}>
            <option className="select-style" value="desc">Descending</option>
            <option className="select-style" value="asc">Ascending</option>
          </select>
        </div>

        <Link
          href="/createProposal"
          className="font-bold bg-white rounded-4xl px-3 py-2 focus:outline-none shadow-md shadow-gray-200 transition-transform duration-200 ease-in-out hover:scale-105 mt-6 mb-2 mr-8 active:scale-95 inline-block"
          >
          Create Proposal
        </Link>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          ProposalHandler("Loading...")
        ) : error ? (
          ProposalHandler(error)
        ) : proposals.length === 0 ? (
          ProposalHandler("No proposals found.")
        ) : (
          <div className="flex flex-col items-center">
            {proposals.map((p) => (
              <Link
                key={p._id}
                href={`/proposalDetails/${p._id}`}
                className="block mb-4"
                style={{ textDecoration: 'none' }}
              >
                <div className="bg-white px-4 py-3 rounded-2xl shadow cursor-pointer transition-transform ease-in-out hover:scale-[1.01] w-[80vw]">
                  {ProposalCard(p)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;