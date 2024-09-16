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
    const [mnemonic, setMnemonicWords] = useState<string[]>(Array(12).fill(" "));
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);

    const handleWalletGenerate = () => {
        let localMnemonic = localStorage.getItem("mnemonicWords");

        if(localMnemonic){
            setMnemonicWords(JSON.parse(localMnemonic));
            toast.success("Mnemonic generated successfully");
            setIsGenerated(true);
            return;
        }

        let generatedMnemonic = bip39.generateMnemonic().split(' ');
        setMnemonicWords(generatedMnemonic);
        toast.success("Mnemonic generated successfully");
        localStorage.setItem("mnemonicWords", JSON.stringify(generatedMnemonic));
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
    }

    return (
        <div className="p-4">
            <Toaster/>
            <button 
                onClick={handleWalletGenerate} 
                type="button" 
                className="border px-4 py-2 bg-blue-500 text-white rounded"
            >
                Generate
            </button>
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
        </div>
    );
}


export default WalletGenerator;
