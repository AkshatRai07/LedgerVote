import BallotAbiJson from '@/abis/Ballot.json'
import type { Abi } from 'viem';
import { useWriteContract, usePublicClient } from 'wagmi'
import { decodeEventLog, parseEther } from 'viem'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

type ProposalArgs = {
  expiryInt: bigint
  minValueToVote: number
  proposalHash: `0x${string}`
  value?: string,
  writeContractAsync: ReturnType<typeof useWriteContract>['writeContractAsync'],
  publicClient: ReturnType<typeof usePublicClient>,
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
  event: any
}> {
  console.log(contractAddress)

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
      args: [expiryInt, parseEther(String(minValueToVote)), proposalHash],
      value: parseEther(value),
    })
    hash = tx
  } catch (err: any) {
    throw new Error(`Contract write failed: ${err.message}`)
  }

  let createdAt: bigint | null = null
  let proposalCreatedEvent: any = null

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  for (const log of receipt.logs) {
    try {
      const event = decodeEventLog({
        abi: BallotAbi,
        ...log,
      })
      if (event.eventName === 'ProposalCreated') {
        proposalCreatedEvent = event

        if (Array.isArray(event.args)) {
          createdAt = BigInt(event.args[1] as string)
        } else if (event.args && typeof event.args === 'object' && 'createdAt' in event.args) {
          createdAt = BigInt((event.args as any).createdAt as string)
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