import { encodePacked, keccak256, Address } from 'viem'

function getProposalHash(
  deployer: Address,
  expiry: bigint,
  title: string,
  options: string[]
): `0x${string}` {
  // Array of types and an array of values to encode
  const types = [
    'address',
    'uint256',
    'string',
    ...Array(options.length).fill('string'),
  ]
  const values = [
    deployer,
    expiry,
    title,
    ...options
  ]
  // encode and hash it
  const packed = encodePacked(types, values)
  return keccak256(packed)
}

export default getProposalHash;