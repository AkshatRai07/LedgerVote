"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import BallotAbiJson from "@/abis/Ballot.json";
import { Abi, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

type Proposal = {
  _id: string;
  proposalCreator: string;
  proposalCreatedAt: Date;
  proposalExpiry: Date;
  proposalTitle: string;
  proposalOptions: string[];
  proposalHash: string;
};

type ProposalOnChain = [
  string,   // creator address
  bigint,   // start time
  bigint,   // end time
  bigint,   // min value to vote (wei)
  string    // proposal hash
];

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const BallotAbi = BallotAbiJson.abi as Abi; // or as Abi if well-typed
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [votes, setVotes] = useState<number[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    fetch(`${API_URL}/proposals/id/${proposalId}`)
      .then(res => res.json())
      .then((res) => {
        setProposal(res[0])
      });
  }, [proposalId]);

  useEffect(() => {
  if (
    !proposal ||
    !proposal.proposalHash ||
    !Array.isArray(proposal.proposalOptions) ||
    proposal.proposalOptions.length === 0 ||
    !publicClient ||
    !address
  ) return;

  let isCurrent = true;

  async function fetchVotes() {

    if (!proposal || !publicClient) return;

    const options = proposal.proposalOptions;
    if (!options || options.length === 0) return;

    const voteCounts: number[] = new Array(options.length).fill(0);

    for (let i = 1; i <= options.length; i++) {
      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: BallotAbi,
          functionName: "votesPerChoice",
          args: [proposal.proposalHash, BigInt(i)],
        });
        voteCounts[i-1] = Number(result || 0);
      } catch (err) {
        console.warn(`No vote data for option ${i}, defaulting to 0 ${err}`);
        voteCounts[i-1] = 0; 
      }
    }
    
    if (isCurrent) setVotes(voteCounts);

    if (address) {
      const userChoice = await publicClient.readContract({
        address: contractAddress,
        abi: BallotAbi,
        functionName: "choiceVoted",
        args: [proposal.proposalHash, address],
      });
      setUserVote(Number(userChoice || 0));
    }
  }

    fetchVotes();
    return () => { isCurrent = false; };
  }, [proposal, address, publicClient]);

  function isExpired() {
    if (!proposal) return true;
    const expiryTime = new Date(proposal.proposalExpiry).getTime();
    return Date.now() > expiryTime;
  }

  async function handleVote(choice: number) {
    if (!proposal) return;
    if (!publicClient) return;
    setLoading(true);
    try {
      const proposalOnChain = await publicClient.readContract({
        address: contractAddress,
        abi: BallotAbi,
        functionName: "proposalByHash",
        args: [proposal.proposalHash],
      }) as ProposalOnChain;

      const minValueToVote = proposalOnChain?.[3] ? String(Number(proposalOnChain[3])/1e18) : "0";

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: BallotAbi,
        functionName: "casteVote",
        args: [proposal.proposalHash, BigInt(choice)],
        value: parseEther(minValueToVote),
      });
      
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      alert("Vote submitted!");
      
      setUserVote(choice);
      
      const numOptions = proposal.proposalOptions.length;
      const voteCounts: number[] = [];
      for (let i = 1; i <= numOptions; i++) {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: BallotAbi,
          functionName: "votesPerChoice",
          args: [proposal.proposalHash, BigInt(i)],
        });
        voteCounts[i - 1] = Number(result || 0);
      }
      setVotes(voteCounts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Voting failed");
      } else {
        alert("Voting failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function getWinner(): string | null {
    if (!votes.length || !proposal) return null;

    const maxVotes = Math.max(...votes);
    const winners = proposal.proposalOptions.filter((_, i) => votes[i] === maxVotes);

    if (winners.length > 1) {
      return "It's a tie!";
    } else {
      return winners[0];
    }
  }

  if (!proposal) return <div className="w-[100vw] h-[100vh] flex justify-center items-center text-7xl text-[#858585] font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
          
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link href="/">
          <span className="font-bold text-xl text-blue-700">Ledger Vote</span>
        </Link>
        <ConnectButton />
      </header>
      
       <main className="flex justify-center py-8">
        <div className="w-[90vw] bg-white p-8 rounded-lg shadow">
          <h1 className="text-4xl font-bold mb-4 break-words">{proposal.proposalTitle}</h1>
          
          <div className="space-y-2 text-gray-700 mb-6">
            <p><span className="font-semibold">Created By:</span>{' '}<span className="break-all">{proposal.proposalCreator}</span></p>
            <p><span className="font-semibold">Created At:</span> {new Date(proposal.proposalCreatedAt).toLocaleString()}</p>
            <p><span className="font-semibold">Expires At:</span> {new Date(proposal.proposalExpiry).toLocaleString()}</p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              <span className={isExpired() ? "text-red-500" : "text-green-500"}>
                {isExpired() ? 'Expired' : 'Active'}
              </span>
            </p>
            {userVote !== null && userVote !== undefined && userVote > 0 && (
              <p><span className="font-semibold">You voted for: </span>{proposal.proposalOptions[userVote - 1]}</p>
            )}
            {isExpired() && (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">This proposal has expired. Voting is closed.</p>
                <p><span className="font-semibold">Winner is: </span>{getWinner()}</p>
              </div>
            )}
          </div>

          <ul className="space-y-8">
            {proposal.proposalOptions.map((option, i) => (
              <li key={i} className="border-none rounded p-4 shadow-lg bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg break-words">{option}</p>
                  <p className="text-sm text-gray-600">Votes: {votes[i] || 0}</p>
                </div>
                <button
                  onClick={() => handleVote(i + 1)}
                  disabled={isExpired() || loading || userVote === i + 1}
                  className={`mt-2 px-4 py-2 rounded-4xl font-bold h-fit transition-transform ease-in-out
                    ${userVote === i + 1 ? "bg-green-200 text-green-900" : "bg-blue-600 text-white hover:scale-[1.05] active:scale-100"} 
                    ${isExpired() ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {userVote === i + 1 ? "Voted" : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
