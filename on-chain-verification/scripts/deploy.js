async function main() {
  const verifierContract = "CartesiVerifier";


  const CartesiVerifier = await ethers.getContractFactory(verifierContract);
  const cartesiVerifier = await upgrades.deployProxy(
    CartesiVerifier
  );

  await cartesiVerifier.waitForDeployment()
  console.log(verifierName, " contract address:", await cartesiVerifier.getAddress());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
