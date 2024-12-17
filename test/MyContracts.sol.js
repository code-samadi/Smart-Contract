const { expect } = require("chai");
const { ethers } = require("hardhat"); // Import ethers from Hardhat

describe("MyContract", function () {
    let myContract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Get signers (accounts) to interact with the contract
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the contract
        const MyContract = await ethers.getContractFactory("MyContract");
        myContract = await MyContract.deploy();
        const deployedAddress = await myContract.getAddress();
        // Log the deployed contract address (optional)
        console.log("MyContract deployed to:", deployedAddress);
        //console.log(myContract);
    });

    it("Should create a new deal", async function () {
        const farmerId = "farmer123";
        const buyerId = "buyer123";
        const cropName = "Wheat";
        const price = ethers.parseUnits("10", 18); // 10 ETH in wei
        const quantity = 500;
        const startDate = "2024-12-01";
        const endDate = "2024-12-20";
        const advancedTransactionId = "txn12345";

        // Call the function to create a deal
        await myContract.createDeal(
            farmerId,
            buyerId,
            cropName,
            price,
            quantity,
            startDate,
            endDate,
            advancedTransactionId
        );

        // Fetch the deal details
        const deal = await myContract.deals(1); // Fetch deal with ID 1

        // Check if the deal details match the expected values
        expect(deal.farmerId).to.equal(farmerId);
        expect(deal.buyerId).to.equal(buyerId);
        expect(deal.cropName).to.equal(cropName);
        expect(deal.price).to.equal(price);
        expect(deal.quantity).to.equal(quantity);
        expect(deal.startDate).to.equal(startDate);
        expect(deal.endDate).to.equal(endDate);
        expect(deal.status).to.equal("start");
        expect(deal.advancedTransactionId).to.equal(advancedTransactionId);
    });

    // Add more tests as needed...
});
