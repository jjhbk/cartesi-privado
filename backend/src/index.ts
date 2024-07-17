import { createApp } from "@deroll/app";
import { decodeFunctionData, encodeAbiParameters, encodePacked, parseAbi, stringToHex, getAddress } from "viem";

// create application
const app = createApp({ url: "http://localhost:8080/host-runner" });
const WhiteList = new Map<string, boolean>();
// define application ABI
const abi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)"
]);
// handle input encoded as ABI function call
app.addAdvanceHandler(async (data) => {
  const { functionName, args } = decodeFunctionData({ abi, data: data.payload });
  switch (functionName) {
    case "checkWhiteList":
      const [user] = args;
      console.log(`checking whitelist status of user: ${user} `);
      if (WhiteList.get(String(user))) {
        app.createReport({ payload: stringToHex(`user : ${user} is white listed`) });
      } else {
        app.createReport({ payload: stringToHex(`user: ${user} is not whitelisted please verify your identity first using privado ID`) });
      }
      return "accept";
    case "addToWhiteList":
      if (getAddress(data.metadata.msg_sender) === getAddress("0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00")) {
        const [user] = args;
        console.log(`adding ${user} to whitelist`);
        WhiteList.set(user, true);
        app.createNotice({ payload: stringToHex(`user: ${user} has been whitelisted`) })
        return "accept"
      }
      app.createReport({ payload: stringToHex("your identity is not verified scan the qr code to verify your identity") });
      return "reject"
  }
});


// start app
app.start().catch((e) => {
  console.log(e);
  process.exit(1);
});