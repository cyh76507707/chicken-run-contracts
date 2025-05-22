const hre = require("hardhat");
const { ethers } = hre;

require("dotenv").config();

const chickenRunAddress = "0x44C00908156bB4e83b3295f7D37E783edB5A1AB7"; // 최신 배포 주소
const chickenTokenAddress = "0x13c2Bc9B3b8427791F700cB153314b487fFE8F5e";

const chickenRunAbi = [
  "function stealChicken(uint256 fid) external",
  "function getPlayerHeldTime(address) view returns (uint256)",
  "function getRecentRecords(uint256) view returns (tuple(uint256 fid, address player, uint256 timestamp)[])",
  "function holder() view returns (address)",
  "function getLeaderboard() view returns (address[] addrs, uint256[] heldTimes, uint256[] rewardTotals)"
];

const tokenAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

// Update stealCost for new logic
const stealCost = ethers.parseEther("1000");

// Utility to delay in seconds
const delay = (s) => new Promise(res => setTimeout(res, s * 1000));
const randDelay = () => Math.floor(Math.random() * 4) + 2; // 2 to 5 seconds

async function main() {
  console.log("🏁 Starting test...");

  const provider = ethers.provider;
  const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const user = new ethers.Wallet(process.env.PRIVATE_KEY_ALT, provider);

  const chickenRunAdmin = new ethers.Contract(chickenRunAddress, chickenRunAbi, admin);
  const chickenRunUser = new ethers.Contract(chickenRunAddress, chickenRunAbi, user);
  const chickenTokenAdmin = new ethers.Contract(chickenTokenAddress, tokenAbi, admin);
  const chickenTokenUser = new ethers.Contract(chickenTokenAddress, tokenAbi, user);

  const fidAdmin = 8106;
  const fidUser = 8151;

  console.log("🔐 Approving Admin...");
  await chickenTokenAdmin.approve(chickenRunAddress, ethers.parseEther("10000"));
  console.log("✅ Admin approve confirmed");

  console.log("🔐 Approving User...");
  await chickenTokenUser.approve(chickenRunAddress, ethers.parseEther("10000"));
  console.log("✅ User approve confirmed");

  // Attempt steal with delay and logging
  const attemptSteal = async (player, contract, fid, label) => {
    const before = await chickenTokenAdmin.balanceOf(player.address);
    console.log(`🐔 ${label} attempting to steal chicken (fid: ${fid})...`);
    try {
      const tx = await contract.stealChicken(fid);
      await tx.wait();

      const after = await chickenTokenAdmin.balanceOf(player.address);
      const paid = before - after;

      const holder = await chickenRunAdmin.holder();
      const success = holder.toLowerCase() === player.address.toLowerCase();

      console.log(`🎲 Result: ${success ? "✅ SUCCESS" : "❌ FAIL"} (CHICKEN Paid: ${ethers.formatEther(paid)} tokens)`);
      console.log(`📦 New Holder: ${holder}`);
    } catch (err) {
      console.log(`💥 Tx reverted for ${label}:`);
      console.log(`• Message: ${err.message}`);
      if (err.code) console.log(`• Code: ${err.code}`);
      if (err.reason) console.log(`• Reason: ${err.reason}`);
      if (err.transaction?.hash) console.log(`• Tx Hash: ${err.transaction.hash}`);
    }
  };

  // Admin steals first
  await attemptSteal(admin, chickenRunAdmin, fidAdmin, "Admin");

  // Wait random 2–5 seconds
  const delay1 = randDelay();
  console.log(`⏳ Waiting ${delay1} seconds...`);
  await delay(delay1);

  // User steals
  await attemptSteal(user, chickenRunUser, fidUser, "User");

  // Wait again
  const delay2 = randDelay();
  console.log(`⏳ Waiting ${delay2} seconds...`);
  await delay(delay2);

  // Admin steals again
  await attemptSteal(admin, chickenRunAdmin, fidAdmin, "Admin");

  // Final balances and held time
  const balAdmin = await chickenTokenAdmin.balanceOf(admin.address);
  const balUser = await chickenTokenUser.balanceOf(user.address);
  console.log(`💰 Final Admin balance: ${ethers.formatEther(balAdmin)} CHICKEN`);
  console.log(`💰 Final User balance: ${ethers.formatEther(balUser)} CHICKEN`);

  const heldAdmin = await chickenRunAdmin.getPlayerHeldTime(admin.address);
  const heldUser = await chickenRunAdmin.getPlayerHeldTime(user.address);
  console.log(`⏱️ Admin held time: ${heldAdmin} seconds`);
  console.log(`⏱️ User held time: ${heldUser} seconds`);

  // Fetch leaderboard
  const leaderboard = await chickenRunAdmin.getLeaderboard();

  console.log("🏆 Leaderboard:");
  for (let i = 0; i < leaderboard.addrs.length; i++) {
    console.log(`👤 ${i + 1}. ${leaderboard.addrs[i]}`);
    console.log(`   🕒 Held Time: ${leaderboard.heldTimes[i]} sec`);
    console.log(`   💸 Total Reward: ${ethers.formatEther(leaderboard.rewardTotals[i])} CHICKEN`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});