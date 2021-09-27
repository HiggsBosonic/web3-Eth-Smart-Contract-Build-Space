import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import waveportal from './utils/WavePortal.json';
import {ChakraProvider,Divider, extendTheme,Center,Text, Input, Button, StylesProvider, Box,List, ListItem} from '@chakra-ui/react';
import StarfieldAnimation from 'react-starfield-animation'

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark"
  }
});

const Card = ({address, timestamp, message}) => {
  


  return (
    <ListItem mt={4} mb={4}>
      <Box as="section" borderWidth="1px" borderRadius="lg" px="6" py="1">
      <Box as="dl">
        <Box color="blue.200" as="dt" mt={2} mb={2}>
        Address <Divider orientation="vertical" /> {address}
        </Box>
        <Divider/>
        <Box color="blue.200" as="dt" mt={2} mb={2}>Timestamp <Divider orientation="vertical" /> {timestamp}</Box>
        <Divider/>
        <Box color="blue.200" as="dt" mt={2} mb={2}>Message <Divider orientation="vertical" /> {message}</Box>
        </Box>
      </Box>
    </ListItem>
  );
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x2dC6FA0e25758A111C08Da13B6815ac5249Ad97e";
  const [tnxStatus, setTnxStatus] = useState('');
  const [inputData, setInputData] = useState('');
  
  
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
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
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      	    console.log("connected", accounts[0]);	
    setCurrentAccount(accounts[0]);
    } catch(error) {	
      console.log(error)	
    }	
  }

const getAllWaves = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, waveportal.abi, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.writer,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [{
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          },...prevState]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
}


  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, waveportal.abi, signer);

        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTnxStatus("Throw Hammer")

        const waveTxn = await waveportalContract.wave(inputData, {gasLimit:300000});	
        setTnxStatus("Hammer Thrown")
        console.log("Mining...", waveTxn.hash)


        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total throw count...", count.toNumber())
        setInputData("");

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      setTnxStatus("Failed")
    }
  }

      const handleChange = (event) => {
      setInputData(event.target.value);
    }
  

  useEffect(()=> {
    checkIfWalletIsConnected();
  },[])

 
  return (

    <ChakraProvider theme={theme}>
    <StylesProvider>
    
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        <h2>
        I recently had a son, we named him Thor, throw a hammer for the young lad!
        </h2>
        </div>

<Input onChange={handleChange} value={inputData} placeholder="Where will you throw your hammer to?" 
        size="lg" mt={5} borderColor="purple.300"
        ></Input>

        <Button color="purple.200" className="hammerButton" onClick={wave}>
          Throw your Hammer!
        </Button>	

         {!currentAccount ? (
          <Button className="hammerButton" color="purple.200" onClick={connectWallet}>
          Connect Wallet
          </Button>
        ): (
              <div className="status"><div>Status: {tnxStatus ? tnxStatus : "Hammer not thrown yet"}</div>
              <div>A total of {allWaves.length} hammers have been thrown into the cosmos.</div>
            </div>)}

        
          {allWaves.map((waves,index) => {

          return (
          <Card key={index} address={wave.address} timestamp={wave.timestamp.toString()} message={wave.message}/>
          )
          })}
        
            <StarfieldAnimation
          numParticles={400}
          style={{
            position: 'absolute',
            zIndex: -1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </div>
    </div>
          
    </StylesProvider>
    </ChakraProvider>
    
  );
}

export default App
