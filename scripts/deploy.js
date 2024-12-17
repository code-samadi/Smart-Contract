require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    // Get the contract factory
    const contractApi = await ethers.getContractFactory("MyContract");

    // Deploy the contract
    const contractApi_ = await contractApi.deploy();

    // Wait for the contract deployment to be mined
    await contractApi_.waitForDeployment();

    // Access the contract address after deployment
    const address_1 =await contractApi_.getAddress();

    console.log(`Contract Address: ${address_1}`);
}

// Execute the main function
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});