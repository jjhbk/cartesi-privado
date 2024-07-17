import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import { FC } from "react";
const config: any = configFile;
import { Input } from "./input";
import { useState } from "react";
import { Inspect } from "./inspect";
import { Notice } from "./notices";
import { Report } from './reports';
import { Voucher } from './vouchers';
export const Network: FC = () => {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
    const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
    const [dappAddress, setDappAddress] = useState<string>(
        "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
    );
    return (
        <div>
            {!wallet && (
                <button onClick={() => connect()}>
                    {connecting ? "connecting" : "connect"}
                </button>
            )}
            {wallet && (
                <div>
                    <label>Switch Chain</label>
                    {settingChain ? (
                        <span>Switching chain...</span>
                    ) : (
                        <select
                            onChange={({ target: { value } }) => {
                                if (config[value] !== undefined) {
                                    setChain({ chainId: value });
                                } else {
                                    alert("No deploy on this chain");
                                }
                            }}
                            value={connectedChain?.id}
                        >
                            {chains.map(({ id, label }) => {
                                return (
                                    <option key={id} value={id}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    <button onClick={() => disconnect(wallet)}>Disconnect Wallet</button>
                    <div>
                        Dapp Address: <input
                            type="text"
                            value={dappAddress}
                            onChange={(e) => setDappAddress(e.target.value)}
                        />
                        <br /><br />
                    </div>
                    <Input dappAddress={dappAddress} />
                    <Inspect />
                    <Report />
                    <Notice />
                    <Voucher dappAddress={dappAddress} />
                </div>
            )
            }
        </div >
    );
};