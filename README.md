# Otonom Fund Frontend

**LIVE HACKATHON MVP: [https://pad.otonom.fund](https://pad.otonom.fund)**
**(Main Project Site, Litepaper & Pitch Deck: [https://otonom.fund](https://otonom.fund))**

This is the Next.js frontend for the Otonom Fund, a decentralized launchpad for AI startups on the Solana blockchain. The ultimate aim is to evolve Otonom Fund into a fully community-governed Decentralized Autonomous Organization (DAO), featuring an innovative **Dual-Token Stability Model** to enhance investor security and platform utility.

**For a comprehensive overview of the Otonom Fund project, including its architecture, smart contract details, overall setup guides, and other documentation, please refer to the main [Otonom Fund Documentation Hub](https://github.com/Otonom-Launchpad/otonom-docs/blob/main/README.md).**

This frontend allows users to connect their Solana wallets, interact with the Otonom Fund smart contracts on the devnet, create user profiles, and explore AI project listings. This project was developed for the Solana Breakout Hackathon.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Solana Integration

This project includes direct integration with the Solana blockchain using:

- **Web3.js / @solana/web3.js**: For blockchain transactions and account management.
- **@solana/spl-token**: For SPL token operations, including Associated Token Accounts (ATAs).
- **@solana/wallet-adapter-react & related packages**: For seamless wallet connection (e.g., Phantom) and transaction signing.
- **Anchor/BN.js**: For interacting with Anchor programs and handling large numbers.

### Program Integration

The frontend is configured to interact with our custom Anchor program deployed on the Solana devnet (Program ID: `CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf`). Key features of this integration include:

- Manual transaction building with proper account structure for Anchor program calls.
- Custom instruction data serialization compatible with the Anchor program.
- Support for on-chain operations such as user profile creation and project initialization.
- All blockchain transactions are real and verifiable on the Solana Explorer (devnet).

For details on the smart contract's source code, architecture, and deployment, please see the [otonom-contracts repository](https://github.com/Otonom-Launchpad/otonom-contracts).

### Development and Testing

To test the Solana integration:

1. Connect a Phantom wallet (devnet)
2. Use the "Test: Initialize Project" button to create a new project on-chain
3. Verify transactions on Solana Explorer (devnet)

All blockchain transactions are real and verifiable on-chain for hackathon judging.
