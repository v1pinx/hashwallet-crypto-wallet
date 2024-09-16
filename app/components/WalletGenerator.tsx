"use client";
import { useState } from 'react';
import * as bip39 from 'bip39';
import { derivePath } from "ed25519-hd-key";
import { Keypair } from '@solana/web3.js';
import nacl from "tweetnacl";
import { ethers } from 'ethers';
import bs58 from "bs58";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface Wallet {
    publicKey: string;
    privateKey: string;
    mnemonic: string;
}

const WalletGenerator = () => {
    const [mnemonic, setMnemonicWords] = useState<string[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);
    const [blockchainType, setBlockchainType] = useState<string | null>(null);
    const [accountIndex, setAccountIndex] = useState(0);

    // Generate Mnemonic once and store it
    const handleBlockchainSelect = (type: string) => {
        if(!mnemonic.length){
            const generatedMnemonic = bip39.generateMnemonic().split(' ');
            setMnemonicWords(generatedMnemonic);
            toast.success("Mnemonic generated successfully");
        }
        setBlockchainType(type);
    }

    const handleWalletGenerate = () => {
        if(!blockchainType || !mnemonic.length){
            toast.error("Please select a blockchain type and generate a mnemonic.");
            return;
        }

        const mnemonicString = mnemonic.join(' ');
        generateWalletFromMnemonic(mnemonicString, blockchainType, accountIndex);

        setAccountIndex(accountIndex + 1);
        setIsGenerated(true);
    }

    const handleCopyToClipboard = () => {
        
        const mnemonicString = mnemonic.join(' ');
        navigator.clipboard.writeText(mnemonicString)
            .then(() => {
                toast.success("Mnemonic copied to clipboard!");
            })
            .catch((error) => {
                console.error("Failed to copy mnemonic to clipboard: ", error);
                toast.error("Failed to copy mnemonic to clipboard.");
            })
    }

    const generateWalletFromMnemonic = (
        mnemonic: string,
        pathType: string,
        accountIndex: number
    ) => {
        const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
        const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
        const {key: derivedSeed} = derivePath(path, seedBuffer.toString('hex'));

        let publicKeyEncoded : string;
        let privateKeyEncoded : string;

        if(pathType == '501'){
            // Solana Seed
            const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
            const keyPair = Keypair.fromSecretKey(secretKey);
            
            privateKeyEncoded = bs58.encode(secretKey);
            publicKeyEncoded = keyPair.publicKey.toBase58();
        }else if(pathType == '60'){
            // Ethereum Seed
            const privateKey = Buffer.from(derivedSeed).toString('hex');
            privateKeyEncoded = privateKey;

            const wallet = new ethers.Wallet(privateKey);
            publicKeyEncoded = wallet.address;
        }else{
            toast.error("Error in generating Wallet.");
            return;
        }

        const wallet : Wallet = {
            publicKey: publicKeyEncoded,
            privateKey: privateKeyEncoded,
            mnemonic
        };

        setWallets((preWallets) => [...preWallets, wallet]);
    }

    return (
        <div className="p-4">
            <Toaster />
            {!blockchainType ? (
                <div>
                    <button
                        onClick={() => handleBlockchainSelect('501')} // Solana
                        type="button"
                        className="border px-4 py-2 bg-black text-white rounded mx-2"
                    >
                        Solana
                    </button>
                    <button
                        onClick={() => handleBlockchainSelect('60')} // Ethereum
                        type="button"
                        className="border px-4 py-2 bg-white text-black rounded mx-2"
                    >
                        Ethereum
                    </button>
                </div>
            ) : (
                <div>
                    <h3 className="text-md font-semibold">
                        Selected Blockchain: {blockchainType === '501' ? 'Solana' : 'Ethereum'}
                    </h3>
                    <button
                        onClick={handleWalletGenerate}
                        type="button"
                        className="border px-4 py-2 bg-green-500 text-white rounded mt-4"
                    >
                        Generate Wallet
                    </button>
                </div>
            )}

            {mnemonic.length > 0 && mnemonic[0].trim() && isGenerated && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4"
                >
                    <div className="mt-4">
                        <h3 className="text-lg font-bold">Your Mnemonic:</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {mnemonic.map((word, index) => (
                                <span key={index} className="bg-gray-200 px-2 py-1 rounded text-black">
                                    {word}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={handleCopyToClipboard}
                            type="button"
                            className="flex items-center bg-gray-500 text-white p-2 mt-2 rounded hover:bg-gray-600"
                        >
                            <FontAwesomeIcon icon={faClipboard} className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {wallets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                >
                    <h3 className="text-lg font-bold">Generated Wallets:</h3>
                    {wallets.map((wallet, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded mt-4">
                            <h4 className="text-md font-semibold">Wallet {index + 1}:</h4>
                            <p><strong>Public Key:</strong> {wallet.publicKey}</p>
                            <p><strong>Private Key:</strong> {wallet.privateKey}</p>
                            <p><strong>Account Index:</strong> {index}</p>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}


export default WalletGenerator;
