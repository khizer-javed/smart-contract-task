const { ethers } = require("ethers");
require("dotenv").config();

const myAddress = process.env.ACCOUNT_ADDRESS;
const friendsAddress = process.env.FRIENDS_ACCOUNT_ADDRESS;

const initializeContract = () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require("./contracts/abi.json"),
      wallet
    );
    return contract;
  } catch (error) {
    console.log("🚀 ~ initializeContract ~ error:", error);
  }
};

const tokenService = {
  getBalance: async (address) => {
    const contract = initializeContract();
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18);
  },

  transferTokens: async (to, amount) => {
    console.log(`Transfering ${amount} amount to friends address...`);
    const contract = initializeContract();
    const tx = await contract.transfer(to, ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    return tx.hash;
  },

  listenForTransfers: () => {
    const contract = initializeContract();
    contract.on("Transfer", (from, to, value) => {
      console.log(`New transfer:
      From: ${from}
      To: ${to}
      Amount: ${ethers.utils.formatUnits(value, 18)} MDEX`);
    });
  },
};

const web3TransactionLogs = async () => {
  console.log("");
  console.log("------------------------------------------");
  console.log("--------------Greetings Web3--------------");
  console.log("------------------------------------------");
  console.log("");
  console.log("----- Fetching balance...");
  const balance = await tokenService.getBalance(myAddress);
  const friendsBalance = await tokenService.getBalance(friendsAddress);
  console.log("Your current balance:", balance);
  console.log("Friends current balance:", friendsBalance);
  console.log("");

  console.log("");
  const txHash = await tokenService.transferTokens(friendsAddress, "100");
  console.log("Transaction hash:", txHash);
  console.log("");

  console.log("----- Fetching new balances...");
  const myNewBalance = await tokenService.getBalance(myAddress);
  const friendsNewBalance = await tokenService.getBalance(friendsAddress);
  console.log("Your new balance:", myNewBalance);
  console.log("Friend's new balance:", friendsNewBalance);
};

module.exports = web3TransactionLogs;
