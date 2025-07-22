# Ledger Vote

**Ledger Vote** is a Web3 voting application that enables decentralized, transparent voting on the Ethereum blockchain. This project includes three components:

- `contracts` — Ethereum smart contracts (written in Solidity using Forge)
- `backend` — Express.js API server managing proposal data and MongoDB connection
- `frontend` — Next.js React app interacting with the contracts and backend

## Table of Contents

- [Features](#features)  
- [Prerequisites](#prerequisites)  
- [Local Development](#local-development)  
- [Deployment](#deployment)  
- [Environment Variables](#environment-variables)  
- [Usage](#usage)  
- [License](#license)  

## Features

- Create and vote on proposals on-chain
- View live proposal statistics
- MongoDB backend for storing proposals metadata
- WalletConnect / RainbowKit integration for wallet connection
- Fully typed with TypeScript

## Prerequisites

- Node.js (v16+)
- npm
- Anvil (foundry) for local EVM chain simulation
- MongoDB instance (local or cloud)
- Metamask or compatible wallet

## Local Development

### Step 1: Smart Contracts

1. Open a terminal in the `contracts` folder. Run Anvil (local EVM node):

    ```
    anvil
    ```

2. Open a second terminal in the same `contracts` folder and build and deploy the contracts:

    ```
    forge clean
    forge build
    forge script script/Ballot.s.sol --fork-url http://127.0.0.1:8545 --broadcast --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```

### Step 2: Backend

1. In the `backend` folder, create a `.env` file including these environment variables:

    ```
    PORT=4000
    FRONTEND_URL=http://localhost:3000
    MONGODB_URI=<your-mongodb-uri>
    ```

2. Run the backend server:

    ```
    npx ts-node server.ts
    ```

### Step 3: Frontend

1. In the `frontend` folder, create a `.env` file including:

    ```
    NEXT_PUBLIC_PROJECT_ID=<your-project-id-from-dashboard.reown.com>
    NEXT_PUBLIC_API_URL=http://localhost:4000
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
    ```

2. Run the frontend:

    ```
    npm run dev
    ```

    Open your browser to `http://localhost:3000`

## Environment Variables

| Variable                | Description                                   | Location         |
|-------------------------|-----------------------------------------------|------------------|
| `SEPOLIA_RPC_URL`       | RPC URL for Sepolia testnet                    | contracts/.env   |
| `METAMASK_PRIVATE_KEY`  | Private key for wallet deployment              | contracts/.env   |
| `ANVIL_ACCOUNT_ONE_PRIVATE_KEY` | Private key for local Anvil account     | contracts/.env   |
| `ETHERSCAN_API_KEY`     | Etherscan API Key for contract verification    | contracts/.env   |
| `PORT`                  | Backend server port (default 4000)             | backend/.env     |
| `FRONTEND_URL`          | URL where frontend runs (e.g., http://localhost:3000) | backend/.env     |
| `MONGODB_URI`           | Connection string for MongoDB database         | backend/.env     |
| `NEXT_PUBLIC_PROJECT_ID`| Project ID from reown dashboard for wallet connections | frontend/.env    |
| `NEXT_PUBLIC_API_URL`   | Backend API URL for frontend requests           | frontend/.env    |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed smart contract address          | frontend/.env    |

## Deployment

1. Deploy your smart contracts to the desired network and note the contract address.

2. Configure backend environment variables appropriately and deploy your backend server.

3. Configure frontend environment variables with the backend URL and contract address, then build and deploy the frontend.

## Usage

- Connect your wallet via the frontend.
- View existing proposals or create new ones.
- Cast votes which are recorded on-chain.
- See live vote counts and proposal stats.

## License

MIT © Akshat Rai
