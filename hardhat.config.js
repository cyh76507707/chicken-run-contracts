require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.23",
  networks: {
    base: {
      url: process.env.ALCHEMY_BASE_URL,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_ALT],
      chainId: 8453,
    }
  }
};