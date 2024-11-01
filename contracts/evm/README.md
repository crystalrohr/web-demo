# Crystalrohr EVM Protocol

Crystalrohr is a decentralized video captioning protocol built on EVM chains. It uses a weighted selection algorithm to choose a node from a pool of stakers. The selected node captions the user's video and submits the job back to the protocol.

## Project Components

1. **Protocol**: The core of the Crystalrohr system. It manages the node selection process, video submission, and caption completion.
2. **Staking**: Enables nodes to stake tokens, which determines their chances of being selected for captioning tasks.
3. **ROHR Token**: An ERC20 token used for staking and rewards within the Crystalrohr ecosystem.

## Important Note on Randomness

The current implementation uses block timestamp and difficulty for random node selection. This method is not truly random and can be manipulated by miners. In future updates, we plan to implement a verifiable random function (VRF) for more secure and fair node selection.

## Deployments

### Base-Sepolia

- Token: [src/Token.sol:RohrToken](https://sepolia.basescan.org/address/0x862f53586b66fbf967e36bd7dcf2e4cbe66a0a02)
- Staking: [src/Staking.sol:CrystalrohrStaking](https://sepolia.basescan.org/address/0xeb9a2e6b622ca084a2dc09fff9f705aecabff147)
- Protocol: [src/Protocol.sol:CrystalrohrProtocol](https://sepolia.basescan.org/address/0xfa20302ca97b38dfe86cda64c7ce7875a0adb257)

## Quick Start

### Prerequisites

- [Forge](https://github.com/foundry-rs/foundry/tree/master/forge) (part of the Foundry toolkit)
- [Cast](https://github.com/foundry-rs/foundry/tree/master/cast) (also part of Foundry, for contract interactions)
- [Solidity](https://docs.soliditylang.org/) (version 0.8.20)

### Install Foundry

If you haven't installed Foundry yet, you can do so by running:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Clone the Repository

```bash
git clone https://github.com/your-username/crystalrohr-solidity.git
cd crystalrohr-solidity
```

### Install Dependencies

```bash
forge install
```

### Compile the Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy

```bash
forge script script/DeployCrystalrohr.s.sol:DeployCrystalrohr \
    --rpc-url $RPC_URL \
    --chain-id $CHAIN_ID \
    --broadcast \
    --verify \
    -vvvv
```

## Contributing

Contributions to Crystalrohr are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
