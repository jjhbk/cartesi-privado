"use client"
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import configFile from "./config.json";
import { Network } from "./network";
import QRCode from "react-qr-code";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
//import { verifyMessage } from "ethers/lib/utils";
import { encodeFunctionData, parseAbi } from 'viem';
const styles = {
  root: {
    color: "#2C1752",
    fontFamily: "sans-serif",
    textAlign: "center"
  },
  title: {
    color: "#7B3FE4"
  }
};



const ngrok_url = "<your_ngrok_url>";
const amoy_rpc_url = "<your_rpc_url>";
// update with your contract address
const deployedContractAddress = "0x676A0270692461917E6A7fC6f92233E7418d3BBa";
const id = uuidv4();
// more info on query based requests: https://0xpolygonid.github.io/tutorials/wallet/proof-generation/types-of-auth-requests-and-proofs/#query-based-request
const qrProofRequestJson = {
  "id": `${id}`,
  "typ": "application/iden3comm-plain-json",
  "type": "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
  "thid": `${id}`,
  "body": {
    "reason": "airdrop participation",
    "transaction_data": {
      "contract_address": "0x45F1D460F024a9E2Db58C4f6B47FC9dAb76856db",
      "method_id": "b68967e2",
      "chain_id": 80002,
      "network": "polygon-amoy"

    },
    "scope": [
      {
        "id": 1,
        "circuitId": "credentialAtomicQuerySigV2OnChain",
        "query": {
          "allowedIssuers": ["*"],
          "context": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
          "credentialSubject": {
            "birthday": {
              "$lt": 20020101
            }
          },
          "type": "KYCAgeCredential"
        }
      }
    ]
  }
};

const onchain_qr_proof_request = {
  "id": `${id}`,
  "typ": "application/iden3comm-plain-json",
  "type": "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
  "thid": `${id}`,
  "body": {
    "reason": "airdrop participation",
    "transaction_data": {
      "contract_address": "0xf3b2CD144940D1D116e4A58B8d38B898aAe8cfed",
      "method_id": "b68967e2",
      "chain_id": 80002,
      "network": "polygon-amoy"
    },
    "scope": [
      {
        "id": 1,
        "circuitId": "credentialAtomicQuerySigV2OnChain",
        "query": {
          "allowedIssuers": [
            "*"
          ],
          "context": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
          "credentialSubject": {
            "birthday": {
              "$lt": 20020101
            }
          },
          "type": "KYCAgeCredential"
        }
      }
    ]
  }
}

const config = configFile;
const injected = injectedModule();
init({
  wallets: [injected],
  chains: Object.entries(config).map(([k, v]: [string, any], i) => ({
    id: k,
    token: v.token,
    label: v.label,
    rpcUrl: v.rpcUrl,
  })),
  appMetadata: {
    name: "DecentraAds",
    icon: "<svg><svg/>",
    description: "Decentralized Marketplace for Adspaces",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});


export default function Home() {
  const [qrcode, setQrcode] = useState(qrProofRequestJson);
  console.log("hello world");
  const dappAbi = parseAbi([
    "function checkWhiteList(address user)",
    "function addToWhiteList(address user)"
  ]);


  const getAuthRequest = () => {

    const options = {
      headers: {
        "ngrok-skip-browser-warning": true // Set content type to JSON
      },
      // Convert JSON data to a string and set it as the request body
    };

    fetch(`http://localhost:8805/api/sign-in`)
      .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Parse the response as JSON
        return response.json()

      })
      .then(data => {
        // Handle the JSON data
        console.log(data);
        setQrcode(data);

      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  }
  return (
    <div>
      <h1>DECENTRAADS</h1>
      <Network />
      <div >
        <h2 >
          ERC20 Token Transfer using Polygon ID On chain Verification for users greater than 18 years of age
        </h2>
        <p>Scan the QR code to prove your age</p>

        <div>
          <QRCode
            level="Q"
            style={{ marginLeft: 50, alignContent: 'center', width: 256 }}
            value={JSON.stringify(qrcode)}
          />
        </div>
        <br />
        <br />

        <button onClick={getAuthRequest}>Get Qr-code</button>
        <br />
        <br />

        <button onClick={() => {
          console.log('abi encoded data check is:', encodeFunctionData({ abi: dappAbi, functionName: 'checkWhiteList', args: ['0x08208F5518c622a0165DBC1432Bc2c361AdFFFB1'] }));
          console.log('abi encoded data to add is:', encodeFunctionData({ abi: dappAbi, functionName: 'addToWhiteList', args: ['0x08208F5518c622a0165DBC1432Bc2c361AdFFFB1'] }));

          setQrcode(onchain_qr_proof_request)
        }}>Get on chain Qr-code</button>
        <p>
          Polygonscan:{" "}
          <a
            href={`https://mumbai.polygonscan.com/token/${deployedContractAddress}`}
            target="_blank"
          >
            ERC20TokenAddress
          </a>
        </p>
      </div>
    </div>
  );
}
