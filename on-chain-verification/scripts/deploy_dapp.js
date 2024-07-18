const { ethers } = require("hardhat");
const SelfhostedDappFactory = require('../abi/SelfHostedApplicationFactory.json');
async function main() {
    const owner = "0x08208F5518c622a0165DBC1432Bc2c361AdFFFB1";
    let selfhostedDappFactory = await ethers.getContractAt(SelfhostedDappFactory.abi, SelfhostedDappFactory.address);
    let templateHash = "0xa3625cde0d024fcdd29f261dcd0cc258da460c333a4cb68f3e9c6041593b92c1";// "0x9addf0ebe8de0968abee8e2ecc16fda2ba85257ab42d516163ea066500baecca";
    let salt = "0x53b5732403fceada576945e3ce5f62a28c547855ecd10d39074d6e92ef6e0dff";
    try {
        // const txId = await selfhostedDappFactory.deployContracts(owner, owner, templateHash, salt);
        const txId = await selfhostedDappFactory.calculateAddresses(owner, owner, templateHash, salt);

        console.log("dapp created set: ", txId);
    } catch (e) {
        console.log("error: ", e);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
