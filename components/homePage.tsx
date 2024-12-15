'use client';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState, } from 'react';
import Web3 from 'web3';
import { AlertDestructive } from './alertDestructive';
import EthCard from './ethPricePanel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import InputMask from "react-input-mask";
import { set } from 'react-hook-form';

export default function Home() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [desiredValue, setDesiredValue] = useState('');
  const [buyAmount, setBuyAmount] = useState('');  
  const [price, setPrice] = useState<number | null | string>(null);
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric input

    if (inputValue === '') {
      setDesiredValue('0.00'); // Reset to zero if empty
      return;
    }
    // Format the input value
    const formattedValue = (parseInt(inputValue, 10) / 100).toFixed(2); // Divide by 100 for cents
    setDesiredValue(formattedValue);
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric input

    if (inputValue === '') {
      setBuyAmount('0.00'); // Reset to zero if empty
      return;
    }
    // Format the input value
    const formattedValue = (parseInt(inputValue, 10) / 100).toFixed(2); // Divide by 100 for cents
    setBuyAmount(formattedValue);
  };

  const makeTransaction = async (usdAmount: number, ethPrice: number) => {
    try {
      debugger  
      
      if (!web3Instance) return;
      
      if (!usdAmount || !ethPrice) {
        console.error('Invalid USD amount or ETH price');
        return;
      }

      const res  = await fetch('/api/fetchKeys', { method: 'GET' }); 
      const data = await res.json();
      const privateKey = data.privateKey;  
      // Convert USD amount to ETH
      const ethAmount = usdAmount / ethPrice;
  
      // Prepare transaction parameters
      const gasPrice = await web3Instance.eth.getGasPrice(); // Fetch current gas price
      const gasLimit = 21000; // Standard gas limit for ETH transfer
      const accountAddress = web3Instance.eth.defaultAccount; // Your wallet address
  
      const tx = {
        from: accountAddress,
        to: accountAddress, // Sending ETH to yourself
        value: web3Instance.utils.toWei(ethAmount.toString(), 'ether'), // Convert ETH amount to Wei
        gas: gasLimit,
        gasPrice,
      };

      // Sign the transaction
      const signedTx = await web3Instance.eth.accounts.signTransaction(tx, privateKey);

      // Send the transaction
      const receipt = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction!);
      console.log('Transaction successful:', receipt);
      
    } catch (error) {
      console.error('Error making transaction:', error);

    }
  };
  
  const fetchPriceAndMakeTransaction = async () => {
    try {
      if(desiredValue === '' || buyAmount === '' || price === null) return;

      // transform price to number
      const priceNum = parseFloat(price.toString());
      const desiredValueNum = parseFloat(desiredValue);
      if(priceNum <= desiredValueNum){
        makeTransaction(parseFloat(buyAmount), priceNum);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  }

  
  useEffect(() => {
    const initializeWeb3 = async () => {
      debugger
      // fetch .env info
      const res  = await fetch('/api/fetchKeys', { method: 'GET' }); 
      const data = await res.json();
      
      const providerKey = data.providerKey;
      const privateKey = data.privateKey;  
      // Initialize web3
      const web3instacetest = await new Web3(providerKey);
      
      // verify web3 instance
      if(!web3instacetest) 
        return;

      else  {
        // set, verify for typescript
        await setWeb3Instance(web3instacetest);
      
        // some tests to be sure
        const account = web3instacetest.eth.accounts.privateKeyToAccount(privateKey!);
      
        web3instacetest.eth.accounts.wallet.add(account);
        web3instacetest.eth.defaultAccount = account.address;
      
        console.log(account.address);
      
        web3instacetest.eth.getBalance(account.address).then(console.log);
      
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    if(monitoring || price !== null){
      fetchPriceAndMakeTransaction(); // Initial fetch
    } 
  }, [monitoring, price, desiredValue, buyAmount]);

  const handleMonitorClick = () => {
    if(desiredValue === '' || buyAmount === ''){
      alert('Please enter desired value and buy amount');
      setMonitoring(false);
    } else {
      setMonitoring(!monitoring);
    }
  };
  
  const fetchPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      const formattedPrice = `${data.ethereum.usd.toFixed(2)}`;
      setPrice(formattedPrice);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };



  useEffect(() => {
    fetchPrice(); // Initial fetch
    const interval = setInterval(fetchPrice, 30000); // Fetch every 30 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <p>Connected to your wallet to monitor for transactions!</p>
      
      {errorMessage && (
          <AlertDestructive message={errorMessage} /> 
      )}

      {!errorMessage && (
        <div className='d-flex flex space-x-4 mt-5'> 
        <EthCard currentPrince={price} />
        <Card className="p-2">
          <CardHeader>
            <CardTitle>Desired Price && buy amount</CardTitle>
            <CardDescription>Set the desired price and desired buy amount, when the values match, a transaction will be sent</CardDescription>
          </CardHeader>
          <CardContent className='d-flex row  space-x-5 space-y-5'>
          <div className='d-flex flex  space-x-5'>
            <Input
              value={desiredValue}
              onChange={handleChange}
              maxLength={16}
              className={`w-full p-2 mb-10 border border-gray-300 rounded-lg`}
                      placeholder="Enter Desired Price for 1 ETH"
            ></Input>
            <Input
              value={buyAmount}
              onChange={handleBuyAmountChange}
              maxLength={16}
              className={`w-full p-2 border border-gray-300 rounded-lg`}
              placeholder="Enter Buy amount (in USD)"
            ></Input>
          </div>
          <div className='flex justify-center items-center  space-x-2'>
            <Button 
             onClick={handleMonitorClick}
             className={`w-40  ${monitoring ? 'bg-gray-500 text-blue hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
            >
              {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>

            {monitoring && (
               <svg
               className="w-5 h-5 mr-2 text-white animate-spin"
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
             >
               <circle
                 className="opacity-25"
                 cx="12"
                 cy="12"
                 r="10"
                 stroke="currentColor"
                 strokeWidth="4"
               ></circle>
               <path
                 className="opacity-75"
                 fill="currentColor"
                 d="M4 12a8 8 0 018-8v8H4z"
               ></path>
             </svg>)
             }
          </div>
            
          </CardContent>
        </Card>
        </div>
      )}

    </div>
  );
}
