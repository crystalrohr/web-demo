# Crystalrohr Move Modules

Crystalrohr is a decentralized video captioning protocol built on the Aptos blockchain. It uses a weighted selection algorithm backed by the `randomness` module to choose a node from a pool of stakers. The selected node captions the user's video and submits the job back to the protocol.

## Project Components

1. **Protocol**: The core of the Crystalrohr system. It manages the node selection process, video submission, and caption completion.
2. **Staking**: Enables nodes to stake tokens, which determines their chances of being selected for captioning tasks.
3. **Asset**: An FA (Fungible Asset) token used for staking and rewards within the Crystalrohr ecosystem.

## Prerequisites

- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli)
- [Move language](https://move-language.github.io/move/)

## Quick Start

### Initialize an Account

```bash
aptos init --network devnet
```

### Compile the Modules

```bash
aptos move compile --named-addresses crystalrohr=default
```

### Run Tests

```bash
aptos move test --named-addresses crystalrohr=default --coverage
```

### Deploy

```bash
aptos move deploy-object --address-name crystalrohr
```

## Detailed Setup and Usage

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/crystalrohr.git
   cd crystalrohr
   ```

2. **Configure Move.toml**
   Ensure your `Move.toml` file is correctly set up with the necessary dependencies:

   ```toml
   [package]
   name = "crystalrohr"
   version = "0.0.1"

   [dependencies.AptosFramework]
   git = "https://github.com/aptos-labs/aptos-core.git"
   rev = "mainnet"
   subdir = "aptos-move/framework/aptos-framework"

   [addresses]
   crystalrohr = "_"
   ```

3. **Compile and Test**
   Use the commands in the Quick Start section to compile and test your modules.

4. **Deployment**
   - Ensure you have sufficient funds in your account for deployment.
   - Use the deployment command from the Quick Start section.
   - For a more controlled deployment process, consider using a deployment script (example provided in the `scripts` directory).

5. **Interacting with the Protocol**
   After deployment, you can interact with the protocol using the Aptos CLI or by integrating it into your dApp. Key functions include:
   - Staking tokens to become a node
   - Submitting videos for captioning
   - Completing captioning tasks (for nodes)
   - Claiming rewards

## Contributing

Contributions to Crystalrohr are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).