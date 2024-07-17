import React from "react";
import { useSetChain } from "@web3-onboard/react";
import { useState } from "react";
import configFile from "./config.json";
import { _fetchData } from "ethers/lib/utils";
import { ethers } from "ethers";
const config: any = configFile;
export const Inspect: React.FC = () => {
    const [{ connectedChain }] = useSetChain();
    const [inspectData, setInspectData] = useState<string>("");
    const [reports, setReports] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<any>({});
    const [hexData, setHexData] = useState<boolean>(false);
    const [postData, setPostData] = useState<boolean>(false);


    // const rollups = useRollups();
    const inspectCall = async (str: string) => {
        let payload = str;
        if (hexData) {
            const uint8array = ethers.utils.arrayify(str);
            payload = new TextDecoder().decode(uint8array);
        }
        if (!connectedChain) {
            return;
        }

        let apiURL = ""

        if (config[connectedChain.id]?.inspectAPIURL) {
            apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect`;
        } else {
            console.error(`No inspect interface defined for chain ${connectedChain.id}`);
            return;
        }

        let fetchData: Promise<Response>;
        if (postData) {
            const payloadBlob = new TextEncoder().encode(payload);
            fetchData = fetch(`${apiURL}`, { method: 'POST', body: payloadBlob });
        } else {
            fetchData = fetch(`${apiURL}/${payload}`);
        }
        fetchData
            .then(response => response.json())
            .then(data => {
                setReports(data.reports);
                setMetadata({ metadata: data.metadata, status: data.status, exception_payload: data.exception_payload });
            });
    };
    return (
        <div>
            <div>
                <h1>INSPECT</h1>
                <br></br>
                <input
                    type="text"
                    value={inspectData}
                    onChange={(e) => setInspectData(e.target.value)}
                />
                <input type="checkbox" checked={hexData} onChange={(e) => setHexData(!hexData)} /><span>Raw Hex </span>
                <input type="checkbox" checked={postData} onChange={(e) => setPostData(!postData)} /><span>POST </span>
                <button onClick={() => inspectCall(inspectData)}>
                    Send
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Active Epoch Index</th>
                        <th>Curr Input Index</th>
                        <th>Status</th>
                        <th>Exception Payload</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{metadata.metadata ? metadata.metadata.active_epoch_index : ""}</td>
                        <td>{metadata.metadata ? metadata.metadata.current_input_index : ""}</td>
                        <td>{metadata.status}</td>
                        <td>{metadata.exception_payload ? ethers.utils.toUtf8String(metadata.exception_payload) : ""}</td>
                    </tr>
                </tbody>
            </table>

            <table>
                <tbody>
                    {reports.length === 0 && (
                        <tr>
                            <td colSpan={4}>no reports</td>
                        </tr>
                    )}
                    {reports.map((n: any) => (
                        <tr key={`${n.payload}`}>
                            <td>{ethers.utils.toUtf8String(n.payload)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}