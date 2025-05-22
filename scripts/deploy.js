const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const tokenAddress = process.env.CHICKEN_TOKEN;

  const ChickenRun = await hre.ethers.getContractFactory("ChickenRun");
  const chickenRun = await ChickenRun.deploy(tokenAddress);
  await chickenRun.waitForDeployment();

  console.log("ChickenRun deployed to:", await chickenRun.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});