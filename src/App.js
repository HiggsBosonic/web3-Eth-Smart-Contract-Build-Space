import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import moment from "moment";
import contractABI from './utils/WavePortal.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waveCount, setWaveCount] = useState("?");
  const [allWaves, setAllWaves] = useState([]);
  // address of my WavePortal deployed on Rinkeby
  const contractAddress = "0x2dC6FA0e25758A111C08Da13B6815ac5249Ad97e";

  const getAllWaves = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


    const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object: ", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        await getWaveCount();
        await getAllWaves();
      } else {
        console.log("No authorized account found")
      }

      

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Must connect to MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      await getWaveCount();
      await getAllWaves();

    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (ethereum) {
        // create provider object from ethers library, using ethereum object injected by metamask
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
       
        const waveTxn = await wavePortalContract.wave(messageInput);
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);


        let count = (await wavePortalContract.totalWaveCount()).toNumber();
        setWaveCount(count);
        setMessageInput("");
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const getWaveCount = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();


        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        let count = (await wavePortalContract.totalWaveCount()).toNumber();
        console.log("Retrieved total wave count...", count);
        setWaveCount(count);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
      setLoading(false);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">


<div id='stars2'></div>

        <div id="title">
        <span>
          👋 Hey, I'm Nat
         </span>
        </div>

        <div id="title-small">
          <span>I am trying to get back into building things. Previously: Pro Athlete, Web Dev, Video Game Dev, Marketing, Director of Operations , now Sys Admin. I tend to wander and have found my way to web3. Cheers!</span>
        </div>

        <div id="title-small">
        <br />
        <br />
          <span>I recently had a son, we named him Thor, throw a hammer for the young lad!</span>
          <br />
          <br />
        </div>

        {loading && (
          <div className="bio">Loading...</div>
        )}

        {

        }
    {!currentAccount && (
          <div className="dataContainer">
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}

        {currentAccount && (<div className="dataContainer">
          <input type="text" placeholder=" Where will you throw your hammer to?" value={messageInput} onChange={((event) => setMessageInput(event.target.value))} />
          <button className="waveButton" onClick={wave}>
            Throw a hammer into the Cosmos
          </button>
          <br />
          <br />
        </div>)}


        {allWaves.map((wave, index) => {
          return (
            <div id="hammers" key={index}>
              <div id="hammers-thrown">From: {wave.address}</div>
              <div id="hammers-thrown">At: {wave.timestamp.toString()}</div>
              <div  id="hammers-thrown"style={{marginTop: "8px"}}>"{wave.message}"</div>
            </div>)
        })}
        <div id='stars3'></div>
      </div>
    </div>
  );
}