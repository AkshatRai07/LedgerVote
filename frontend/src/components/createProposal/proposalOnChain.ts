import BallotAbiJson from '@/abis/Ballot.json'
import type { Abi } from 'viem';
import { useWriteContract, usePublicClient } from 'wagmi'
import { decodeEventLog, parseEther } from 'viem'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

type ProposalArgs = {
  expiryInt: bigint
  minValueToVote: string
  proposalHash: `0x${string}`
  value?: string,
  writeContractAsync: ReturnType<typeof useWriteContract>['writeContractAsync']
  publicClient: ReturnType<typeof usePublicClient>
}

type EventType = {
  eventName: string
  args: {
    creator: string
    minValueToVote: bigint
    proposalCreatedAt: bigint
    proposalExpiry: bigint
    proposalHash: string
  }
}

type EventArgs = EventType["args"];

function isEventArgs(obj: unknown): obj is EventType['args'] {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  return (
    typeof rec.creator === "string" &&
    typeof rec.minValueToVote === "bigint" &&
    typeof rec.proposalCreatedAt === "bigint" &&
    typeof rec.proposalExpiry === "bigint" &&
    typeof rec.proposalHash === "string"
  );
}

async function proposalOnChain({
  expiryInt,
  minValueToVote,
  proposalHash,
  value = '0.01',
  writeContractAsync,
  publicClient,
}: ProposalArgs): Promise<{
  txHash: string
  createdAt: bigint | null
  event: EventType
}> {

  const BallotAbi = BallotAbiJson.abi as Abi;

  if (!publicClient) {
    throw new Error('No publicClient found. Please check your Web3 provider setup.');
  }

  let hash: `0x${string}`

  try {
    const tx = await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: BallotAbi,
      functionName: 'createProposal',
      args: [expiryInt, parseEther(minValueToVote), proposalHash],
      value: parseEther(value),
    })
    hash = tx
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Contract write failed: ${err.message}`)
    } else {
      throw new Error("Contract write failed")
    }
  }

  let createdAt: bigint | null = null
  let proposalCreatedEvent: EventType | null = null

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  for (const log of receipt.logs) {
    try {
      const rawEvent = decodeEventLog({
        abi: BallotAbi,
        ...log,
      })

      if (rawEvent.eventName === 'ProposalCreated') {
        let event: EventType;
        if (Array.isArray(rawEvent.args)) {
          const [creator, minValueToVote, proposalCreatedAt, proposalExpiry, proposalHash] = rawEvent.args;
          event = {
            eventName: rawEvent.eventName,
            args: {
              creator: creator as string,
              minValueToVote: minValueToVote as bigint,
              proposalCreatedAt: proposalCreatedAt as bigint,
              proposalExpiry: proposalExpiry as bigint,
              proposalHash: proposalHash as string,
            }
          }
        } else if (rawEvent.args && typeof rawEvent.args === 'object') {
          if (isEventArgs(rawEvent.args)) {
            event = {
              eventName: rawEvent.eventName,
              args: rawEvent.args,
            };
          } else {
            throw new Error("ProposalCreated object-args shape is wrong");
          }
        } else {
          throw new Error("Unknown ProposalCreated args format");
        }

        proposalCreatedEvent = event

        if (Array.isArray(event.args)) {
          createdAt = BigInt(event.args[1] as string)
        } else if (event.args && typeof event.args === 'object' && 'createdAt' in event.args) {
          createdAt = BigInt((event.args as EventArgs).proposalCreatedAt)
        }
        break
      }
    } catch {}
  }

  if (!createdAt && receipt.blockNumber) {
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })
    createdAt = BigInt(block.timestamp)
  }

  if (!proposalCreatedEvent) {
    throw new Error('ProposalCreated event not found in transaction logs.')
  }

  return {
    txHash: hash,
    createdAt,
    event: proposalCreatedEvent,
  }
}

export default proposalOnChain;