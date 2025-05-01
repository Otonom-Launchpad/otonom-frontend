# Otonom Fund Frontend

This is the frontend for the Otonom Fund platform, a multichain launchpad for AI startups built on Solana. This project was developed for the Solana Breakout Hackathon.

This is a [Next.js](https://nextjs.org) project with integrated Solana blockchain functionality.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Solana Integration

This project includes direct integration with Solana blockchain using:

- **Web3.js**: For blockchain transactions and account management
- **@solana/spl-token**: For token operations including Associated Token Accounts (ATAs)
- **@solana/wallet-adapter-react**: For wallet connection and signing

### Program Integration

The frontend interacts with a custom Anchor program deployed on Solana devnet. Key features:

- Manual transaction building with proper account structure
- Custom instruction serialization for Anchor compatibility
- Support for project initialization and investment workflows
- Real on-chain transactions with explorer verification

### Development and Testing

To test the Solana integration:

1. Connect a Phantom wallet (devnet)
2. Use the "Test: Initialize Project" button to create a new project on-chain
3. Verify transactions on Solana Explorer (devnet)

All blockchain transactions are real and verifiable on-chain for hackathon judging.
