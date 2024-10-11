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
import 'remixicon/fonts/remixicon.css';

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
    const [inputMnemonic, setInputMnemonic] = useState<string>("");

    const handleBlockchainSelect = (blockchain: string) => {
        setBlockchainType(blockchain);
        toast.success("Blockchain selected successfully.");
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputMnemonic(event.target.value);
    }

    const generateBtnClicked = () => {
        if (inputMnemonic.trim() === "") {
            const newMnemonic = bip39.generateMnemonic();
            setMnemonicWords(newMnemonic.split(" "));
        } else {
            const words = inputMnemonic.split(" ");
            if (words.length !== 12) {
                toast.error("Please enter 12 words separated by space.");
                return;
            }
            setMnemonicWords(words);
        }
        setIsGenerated(true);
    }

    const handleWalletGenerate = () => {
        if (!blockchainType || !mnemonic.length) {
            toast.error("Please select a blockchain type and generate a mnemonic.");
            return;
        }
        const mnemonicString = mnemonic.join(' ');
        generateWalletFromMnemonic(mnemonicString, blockchainType, accountIndex);
        setAccountIndex(accountIndex + 1);
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
            });
    }

    const generateWalletFromMnemonic = (mnemonic: string, pathType: string, accountIndex: number) => {
        const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
        const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
        const { key: derivedSeed } = derivePath(path, seedBuffer.toString('hex'));

        let publicKeyEncoded: string;
        let privateKeyEncoded: string;

        if (pathType === '501') {
            const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
            const keyPair = Keypair.fromSecretKey(secretKey);
            privateKeyEncoded = bs58.encode(secretKey);
            publicKeyEncoded = keyPair.publicKey.toBase58();
        } else if (pathType === '60') {
            const privateKey = Buffer.from(derivedSeed).toString('hex');
            privateKeyEncoded = privateKey;

            const wallet = new ethers.Wallet(privateKey);
            publicKeyEncoded = wallet.address;
        } else {
            toast.error("Error in generating Wallet.");
            return;
        }

        const wallet: Wallet = {
            publicKey: publicKeyEncoded,
            privateKey: privateKeyEncoded,
            mnemonic
        };
        toast.success("Wallet generated successfully.");
        setWallets((preWallets) => [...preWallets, wallet]);
    }

    const PrivateKeyDisplay = ({ privateKey }: { privateKey: string }) => {
        const [isVisible, setIsVisible] = useState(false);

        return (
            <div>
                <p className='cursor-pointer' onClick={() => setIsVisible(!isVisible)}>
                    <strong>Private Key:</strong> {isVisible ? privateKey : '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </p>
            </div>
        );
    };

    const clearWallets = () => {
        setWallets([]);
        setMnemonicWords([]);
        setIsGenerated(false);
        setAccountIndex(0);
        setBlockchainType(null);
    }

    return (
        <div className="bg-zinc-900 min-h-screen flex flex-col justify-center items-center">
            <Toaster />
            {!blockchainType ? (
                <div className='flex flex-col justify-center items-center h-screen'>
                    <i className="ri-wallet-fill text-5xl text-violet-800"></i>
                    <div className="text-white text-4xl font-bold flex items-center mt-4">Welcome to Hash Wallet</div>
                    <div className="text-white text-center font-medium text-2xl mt-2">Choose a blockchain to get started.</div>
                    <div className='mt-24 text-white flex flex-col gap-4'>
                        <button
                            onClick={() => handleBlockchainSelect('501')} // Solana
                            type="button"
                            className="bg-white text-black px-16 py-3 rounded-xl font-semibold text-sm hover:bg-gray-400 transition"
                        >
                            Solana
                        </button>
                        <button
                            onClick={() => handleBlockchainSelect('60')} // Ethereum
                            type="button"
                            className="bg-zinc-700 px-16 py-3 rounded-xl font-semibold text-sm hover:bg-zinc-800 transition"
                        >
                            Ethereum
                        </button>
                    </div>
                </div>
            ) : null}

            {!mnemonic.length && blockchainType !== null && (
                <div className='h-screen flex flex-col justify-center items-center'>
                    <div className='text-white font-semibold'>
                        Selected blockchain: {blockchainType === '501' ? 'Solana' : 'Ethereum'}
                    </div>
                    <div className="text-white text-4xl font-bold flex items-center mt-2">Secret Recovery Phase</div>
                    <div className="text-white text-center font-medium text-2xl mt-2">Save these words in a safe place.</div>
                    <div className='mt-4 flex gap-2'>
                        <input
                            className='border border-gray-400 px-4 py-2 rounded w-76 sm:w-96'
                            type="text"
                            onChange={handleInputChange}
                            placeholder="Enter your secret phrase ( or leave blank to generate )"
                        />
                        <button
                            type='button'
                            className='px-4 py-2 bg-violet-800 text-white rounded font-semibold hover:bg-violet-700 transition'
                            onClick={generateBtnClicked}
                        >
                            Generate
                        </button>
                    </div>
                </div>
            )}

            {isGenerated && (
                <>
                    <h3 className="text-lg font-bold text-white">Your Mnemonic:</h3>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 p-4 bg-zinc-700 rounded-lg w-[32rem]"
                    >
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {mnemonic.map((word, index) => (
                                <span key={index} className="bg-gray-200 px-2 py-1 rounded text-black text-center">
                                    {word}
                                </span>
                            ))}
                        </div>
                        <div className='flex justify-between mt-2'>
                            <button
                                onClick={handleCopyToClipboard}
                                type="button"
                                className="flex items-center bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={faClipboard} className="h-5 w-5" />
                            </button>
                            <button className='px-4 py-2 bg-violet-800 text-white rounded font-semibold hover:bg-violet-700 transition' type='button' onClick={handleWalletGenerate}>Add Wallet</button>
                        </div>
                    </motion.div>
                </>
            )}

            {wallets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                >
                    <h3 className="text-lg font-bold text-white">Generated Wallets:</h3>
                    {wallets.map((wallet, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded mt-4">
                            <h4 className="text-md font-semibold">Wallet {index + 1}:</h4>
                            <p><strong>Public Key:</strong> {wallet.publicKey}</p>
                            <PrivateKeyDisplay privateKey={wallet.privateKey} />
                            <p><strong>Account Index:</strong> {index}</p>
                        </div>
                    ))}
                    <button
                        onClick={clearWallets}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-500 transition"
                    >
                        Clear Wallets
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default WalletGenerator;
