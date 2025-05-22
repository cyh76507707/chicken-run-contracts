# Chicken Run Contracts

This repository contains the smart contract for the Chicken Run game deployed on Base Mainnet.

## Features

- `stealChicken(fid)`: Allows players to steal the chicken by paying 1000 CHICKEN. The previous holder receives a reward based on their held time.
- Real-time reward payout: 1 CHICKEN per second of held time.
- Leaderboard system based on total held time and total rewards earned.

## Smart Contract

- **Contract address:** [`0x44C00908156bB4e83b3295f7D37E783edB5A1AB7`](https://basescan.org/address/0x44C00908156bB4e83b3295f7D37E783edB5A1AB7)
- **Token used:** CHICKEN  
  - Contract: [`0x13c2Bc9B3b8427791F700cB153314b487fFE8F5e`](https://basescan.org/token/0x13c2Bc9B3b8427791F700cB153314b487fFE8F5e)

## Local Testing

```bash
npx hardhat run scripts/test-steal.js --network base
```

## License

MIT
