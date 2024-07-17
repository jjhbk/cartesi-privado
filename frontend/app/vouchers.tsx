
import { BigNumber, ethers } from "ethers";
import React, { use, useEffect, useState } from "react";
import { useSetChain } from "@web3-onboard/react";
import { getVoucher, getVouchers, executeVoucher, getUnexecutedVouchers } from "cartesi-client";
import { useWallets } from "@web3-onboard/react";
import configFile from './config.json';
const config: any = configFile;
let apiURL = "http://localhost:8080/graphql";
let nodeURL = "http://localhost:8080"
interface IInputPropos {
    dappAddress: string
}
export const Voucher: React.FC<IInputPropos> = (propos) => {
    const [connectedWallet] = useWallets();

    const provider = new ethers.providers.Web3Provider(connectedWallet.provider);

    const [{ connectedChain }] = useSetChain();
    const [vouchers, setVouchers] = useState<any>([]);
    const [voucherResult, setVoucher] = useState<any>();
    const [voucherToExecute, setVoucherToExecute] = useState<any>();
    const [unexVouchers, setunexVouchers] = useState<any>([]);
    if (connectedChain) {
        if (config[connectedChain.id]?.graphqlAPIURL) {
            apiURL = `${config[connectedChain.id].graphqlAPIURL}/graphql`;
            nodeURL = config[connectedChain.id].graphqlAPIURL
        } else {
            console.error(`No inspect interface defined for chain ${connectedChain.id}`);
            return;
        }
    }



    const getAllVouchers = async () => {
        const _unexVouchers = await getUnexecutedVouchers(provider.getSigner(), propos.dappAddress, nodeURL);
        console.log("unexecuted vouchers are:", _unexVouchers);
        setunexVouchers(_unexVouchers);
        const Vouchers = await getVouchers(apiURL);
        console.log("all vouchers are:", Vouchers);

        setVouchers(Vouchers);
        setVouchers(Vouchers.map((n: any) => {
            let payload = n?.payload;
            let inputPayload = n?.input.payload;
            if (inputPayload) {
                try {
                    inputPayload = ethers.utils.toUtf8String(inputPayload);
                } catch (e) {
                    inputPayload = inputPayload + " (hex)";
                }
            } else {
                inputPayload = "(empty)";
            }
            if (payload) {
                const decoder = new ethers.utils.AbiCoder();
                const selector = decoder.decode(["bytes4"], payload)[0];
                payload = ethers.utils.hexDataSlice(payload, 4);
                try {
                    switch (selector) {
                        case '0xa9059cbb': {
                            // erc20 transfer; 
                            const decode = decoder.decode(["address", "uint256"], payload);
                            payload = `Erc20 Transfer - Amount: ${ethers.utils.formatEther(decode[1])} - Address: ${decode[0]}`;
                            break;
                        }
                        case '0x42842e0e': {
                            //erc721 safe transfer;
                            const decode = decoder.decode(["address", "address", "uint256"], payload);
                            payload = `Erc721 Transfer - Id: ${decode[2]} - Address: ${decode[1]}`;
                            break;
                        }
                        case '0x522f6815': {
                            //ether transfer; 
                            const decode2 = decoder.decode(["address", "uint256"], payload)
                            payload = `Ether Transfer - Amount: ${ethers.utils.formatEther(decode2[1])} (Native eth) - Address: ${decode2[0]}`;
                            break;
                        }
                        case '0xf242432a': {
                            //erc155 single safe transfer;
                            const decode = decoder.decode(["address", "address", "uint256", "uint256"], payload);
                            payload = `Erc1155 Single Transfer - Id: ${decode[2]} Amount: ${decode[3]} - Address: ${decode[1]}`;
                            break;
                        }
                        case '0x2eb2c2d6': {
                            //erc155 Batch safe transfer;
                            const decode = decoder.decode(["address", "address", "uint256[]", "uint256[]"], payload);
                            payload = `Erc1155 Batch Transfer - Ids: ${decode[2]} Amounts: ${decode[3]} - Address: ${decode[1]}`;
                            break;
                        }
                        case '0xd0def521': {
                            //erc721 mint;
                            const decode = decoder.decode(["address", "string"], payload);
                            payload = `Mint Erc721 - String: ${decode[1]} - Address: ${decode[0]}`;
                            break;
                        }
                        case '0x755edd17': {
                            //erc721 mintTo;
                            const decode = decoder.decode(["address"], payload);
                            payload = `Mint Erc721 - Address: ${decode[0]}`;
                            break;
                        }
                        case '0x6a627842': {
                            //erc721 mint;
                            const decode = decoder.decode(["address"], payload);
                            payload = `Mint Erc721 - Address: ${decode[0]}`;
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                payload = "(empty)";
            }
            return {
                id: `${n?.id}`,
                index: parseInt(n?.index),
                destination: `${n?.destination ?? ""}`,
                payload: `${payload}`,
                input: n ? { index: n.input.index, payload: inputPayload } : {},
                proof: null,
                executed: null,
            };
        }).sort((b, a) => {
            if (a.input.index === b.input.index) {
                return b.index - a.index;
            } else {
                return b.input.index - a.input.index;
            }
        }))
    }
    const getProof = async (voucher: any) => {
        const _voucher = await getVoucher(apiURL, voucher.index, voucher.input.index);
        console.log("Voucher is?");
        setVoucher(_voucher);
    };

    const _executeVoucher = async (voucher: any) => {
        if (voucher.proof) {

            const newVoucherToExecute = { ...voucher };
            try {
                const signer = await provider.getSigner();
                const tx = await executeVoucher(signer, propos.dappAddress, voucher.input.index, voucher.index, nodeURL);
                console.log("tx is:", tx);
                newVoucherToExecute.msg = `voucher executed! (tx="${tx.transactionHash}")`;
                if (tx.events) {
                    newVoucherToExecute.msg = `${newVoucherToExecute.msg} - resulting events: ${JSON.stringify(tx.events)}`;
                    newVoucherToExecute.executed = true;
                }
            } catch (e) {
                newVoucherToExecute.msg = `COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`;
                console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`);
            }
            setVoucherToExecute(newVoucherToExecute);
        }
    }

    useEffect(() => {
        const setvoucher = async (voucher: any) => {

            voucher.executed = !(unexVouchers.some((_v: any) => { return _v.index == voucher.index && _v.input.index == voucher.input.index }));
            console.log("status is:", voucher.executed)
            setVoucherToExecute(voucher);
        }
        if (voucherResult) {
            setvoucher(voucherResult);
        }
        getAllVouchers();
    }, [voucherResult, apiURL]);


    // const forceUpdate = useForceUpdate();
    return (
        <div>
            <p>Voucher to execute</p>
            {voucherToExecute ? <table>
                <thead>
                    <tr>
                        <th>Input Index</th>
                        <th>Voucher Index</th>
                        <th>Destination</th>
                        <th>Action</th>
                        {/* <th>Payload</th> */}
                        {/* <th>Proof</th> */}
                        <th>Input Payload</th>
                        <th>Msg</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key={`${voucherToExecute.input.index}-${voucherToExecute.index}`}>
                        <td>{voucherToExecute.input.index}</td>
                        <td>{voucherToExecute.index}</td>
                        <td>{voucherToExecute.destination}</td>
                        <td>
                            <button disabled={!voucherToExecute.proof || voucherToExecute.executed} onClick={() => _executeVoucher(voucherToExecute)}>{voucherToExecute.proof ? (voucherToExecute.executed ? "Voucher executed" : "Execute voucher") : "No proof yet"}</button>
                        </td>
                        {/* <td>{voucherToExecute.payload}</td> */}
                        {/* <td>{voucherToExecute.proof}</td> */}
                        <td>{voucherToExecute.input.payload}</td>
                        <td>{voucherToExecute.msg}</td>
                    </tr>
                </tbody>
            </table> : <p>Nothing yet</p>}

            <button onClick={() => getAllVouchers()}>
                Reload
            </button>

            <table>
                <thead>
                    <tr>
                        <th>Input Index</th>
                        <th>Voucher Index</th>
                        <th>Destination</th>
                        <th>Action</th>
                        {/* <th>Input Payload</th> */}
                        <th>Payload</th>
                        {/* <th>Proof</th> */}
                    </tr>
                </thead>
                <tbody>
                    {vouchers.length === 0 && (
                        <tr>
                            <td colSpan={4}>no vouchers</td>
                        </tr>
                    )}
                    {vouchers.map((n: any) => (
                        <tr key={`${n.input.index}-${n.index}`}>
                            <td>{n.input.index}</td>
                            <td>{n.index}</td>
                            <td>{n.destination}</td>
                            <td>
                                <button onClick={() => getProof(n)}>Get Proof</button>
                            </td>
                            {/* <td>{n.input.payload}</td> */}
                            <td>{n.payload}</td>
                            {/* <td>
                                <button disabled={!!n.proof} onClick={() => executeVoucher(n)}>Execute voucher</button>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};