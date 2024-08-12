"use client";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import configFile from "./config.json";
import { Network } from "./network";
import QRCode from "react-qr-code";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
//import { verifyMessage } from "ethers/lib/utils";
import { encodeFunctionData, parseAbi } from "viem";
const styles = {
  root: {
    color: "#2C1752",
    fontFamily: "sans-serif",
    textAlign: "center",
  },
  title: {
    color: "#7B3FE4",
  },
};

const ngrok_url = "<your_ngrok_url>";
const amoy_rpc_url = "<your_rpc_url>";
// update with your contract address
const deployedContractAddress = "0x0Fb484F2057e224D5f025B4bD5926669a5a32786";
const id = uuidv4();
// more info on query based requests: https://0xpolygonid.github.io/tutorials/wallet/proof-generation/types-of-auth-requests-and-proofs/#query-based-request
const amoyqrProofRequestJson = {
  id: "7f38a193-0918-4a48-9fac-36adfdb8b542",
  typ: "application/iden3comm-plain-json",
  type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
  thid: "7f38a193-0918-4a48-9fac-36adfdb8b542",
  body: {
    reason: "airdrop participation",
    transaction_data: {
      contract_address: "0x0Fb484F2057e224D5f025B4bD5926669a5a32786",
      method_id: "b68967e2",
      chain_id: 80002,
      network: "polygon-amoy",
    },
    scope: [
      {
        id: 1,
        circuitId: "credentialAtomicQuerySigV2OnChain",
        query: {
          allowedIssuers: ["*"],
          context:
            "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
          credentialSubject: {
            birthday: {
              $lt: 20020101,
            },
          },
          type: "KYCAgeCredential",
        },
      },
    ],
  },
};

const amoyUqrProofJson = {
  id: "7f38a193-0918-4a48-9fac-36adfdb8b542",
  typ: "application/iden3comm-plain-json",
  type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
  thid: "7f38a193-0918-4a48-9fac-36adfdb8b542",
  body: {
    reason: "Cartesi Verification",
    transaction_data: {
      contract_address: "0x70696036CA1868B42155b06235F95549667Eb0BE",
      method_id: "b68967e2",
      chain_id: 80002,
      network: "polygon-amoy",
    },
    scope: [
      {
        id: 1717138699,
        circuitId: "credentialAtomicQuerySigV2OnChain",
        query: {
          allowedIssuers: ["*"],
          context:
            "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
          credentialSubject: {
            birthday: {
              $lt: 20020101,
            },
          },
          type: "KYCAgeCredential",
        },
      },
    ],
  },
};


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
    name: "Cartesi-Privado Verifier",
    icon: "<svg><svg/>",
    description: "Cartesi Dapp with PrivadoID Verification",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});

export default function Home() {
  const [qrcode, setQrcode] = useState(amoyUqrProofJson);
  console.log("hello world here");

  const getAuthRequest = () => {
    const options = {
      headers: {
        "ngrok-skip-browser-warning": true, // Set content type to JSON
      },
      // Convert JSON data to a string and set it as the request body
    };

    fetch(`http://localhost:8805/api/sign-in`)
      .then((response) => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        // Handle the JSON data
        console.log(data);
        setQrcode(data);
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error("Fetch error:", error);
      });
  };
  return (
    <div>
      <h1>Cartesi-Privado Verifier</h1>
      <Network />
      <div>
        <h2>
          Verify your Age Using Privado ID to start Interacting with Cartesi
          DApp greater than 18 years of age
        </h2>
        <p>
          Scan the QR code with your Polygon ID Wallet APP to prove your age &
          start Interacting
        </p>

        <div>
          <QRCode
            level="Q"
            style={{ marginLeft: 50, alignContent: "center", width: 256 }}
            value={JSON.stringify(qrcode)}
          />
        </div>
        <br />
        <br />
        {/*
        <button onClick={getAuthRequest}>Get Qr-code</button>
        <br />
        <br />

        <button
          onClick={() => {
            setQrcode(onchain_qr_proof_request);
          }}
        >
          Get on chain Qr-code
        </button>
        <p>
          Polygonscan:{" "}
          <a
            href={`https://mumbai.polygonscan.com/token/${deployedContractAddress}`}
            target="_blank"
          >
            ERC20TokenAddress
          </a>
        </p>
*/}
      </div>
    </div>
  );
}
