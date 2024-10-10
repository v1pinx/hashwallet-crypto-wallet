
# Hash Wallet (In Develpoment)

## Overview
Hash Wallet is a simple web-based tool to generate and manage cryptocurrency wallets for both the Solana and Ethereum blockchains. Users can generate a mnemonic phrase, use it to create multiple wallets, and view the associated public and private keys. The project is currently in development and provides a user-friendly interface for blockchain wallet generation.

## Features
- **Blockchain Support**: Generate wallets for Solana or Ethereum by selecting the appropriate blockchain type.
- **Mnemonic Generation**: Automatically generate a 12-word mnemonic phrase or input your own.
- **Multiple Wallets**: Create multiple wallets with unique account indices using the same mnemonic.
- **Public & Private Key Display**: View public keys and toggle the visibility of private keys.
- **Clipboard Support**: Copy the mnemonic phrase to your clipboard with one click.
- **Interactive UI**: Smooth animations using Framer Motion for a seamless user experience.
- **Notifications**: Real-time feedback via toast notifications for actions such as blockchain selection, mnemonic copying, and wallet generation.

## Technologies Used
- **React**: Client-side interface built with React and TypeScript.
- **Solana Web3.js**: Used to generate and manage Solana wallets.
- **Ethers.js**: Used to generate and manage Ethereum wallets.
- **TweetNaCl**: Cryptography library used to derive keypairs from mnemonics.
- **Framer Motion**: Animation library used for smooth transitions and interactions.
- **React Hot Toast**: Library for displaying toast notifications.
- **BIP39**: Mnemonic phrase generation and seed derivation for wallet creation.
- **Ed25519 HD Key**: For hierarchical deterministic key derivation using the Ed25519 curve.
- **FontAwesome**: Icons used in the user interface for better interaction.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hash-wallet-generator.git
   cd hash-wallet-generator
2.  Install the dependencies:
    
    
    `npm install` 
    
3.  Start the development server:
    
    `npm run dev` 
    
4.  Open the application at `http://localhost:3000` in your browser.
    

## Usage

1.  Choose a blockchain (Solana or Ethereum).
2.  Generate a mnemonic or enter an existing one.
3.  Add wallets by generating unique account indices.
4.  View the wallets and toggle private key visibility.
5.  Copy the mnemonic to your clipboard for safekeeping.

## Development

The project is still under development. Upcoming features include:

-   Support for additional blockchains.
-   Enhancements to wallet export options (e.g., save keys to a file).
-   Improved UI/UX for better wallet management.
-   Security features to ensure safe handling of private keys.

## Contributions

Feel free to contribute by submitting a pull request or reporting any issues. All contributions are welcome!

## License

This project is licensed under the MIT License.

