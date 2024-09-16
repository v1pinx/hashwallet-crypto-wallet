"use client";
import { useState } from 'react';
import * as bip39 from 'bip39';

interface Wallet {
    mnemonic: string;
}

const WalletGenerator = () => {
    const [mnemonic, setMnemonicWords] = useState<string[]>(Array(12).fill(' '));

    const handleWalletGenerate = () => {
        let localMnemonic = localStorage.getItem("mnemonicWords");
        console.log(localMnemonic);

        if(localMnemonic){
            setMnemonicWords(JSON.parse(localMnemonic));
            return;
        }

        let generatedMnemonic = bip39.generateMnemonic().split(' ');
        setMnemonicWords(generatedMnemonic);
        localStorage.setItem("mnemonicWords", JSON.stringify(generatedMnemonic));
    }

    return (
        <div className="p-4">
            <button 
                onClick={handleWalletGenerate} 
                type="button" 
                className="border px-4 py-2 bg-blue-500 text-white rounded"
            >
                Generate
            </button>
            {mnemonic.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Your Mnemonic:</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {mnemonic.map((word, index) => (
                            <span key={index} className="bg-gray-200 px-2 py-1 rounded text-black">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export default WalletGenerator;
