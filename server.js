require("dotenv").config();
const cors = require('cors');
const express = require("express");
const { ethers } = require("ethers");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

const PRIVATE_KEY = process.env.PRIVATE_KEY; // in .env file
const VOLTA_RPC_URL = process.env.VOLTA_RPC_URL;// in .env file
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;//in .env file obtained after the deploying the file.

if (!PRIVATE_KEY || !VOLTA_RPC_URL || !CONTRACT_ADDRESS) {
    console.error("Please ensure PRIVATE_KEY, VOLTA_RPC_URL, and CONTRACT_ADDRESS are set in the .env file.");
    process.exit(1);
}

// Load ABI from compiled contract JSON
let contractABI;
try {
    const contractJSON = fs.readFileSync("./artifacts/contracts/MyContracts.sol/MyContract.json", "utf8");
    contractABI = JSON.parse(contractJSON).abi;
} catch (err) {
    console.error("Error loading contract ABI: ", err);
    process.exit(1);
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(VOLTA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize contract instance
const myContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// API to create a deal
app.post("/createDeal", async (req, res) => {
    const { farmerId, buyerId, cropName, price, quantity, startDate, endDate, advancedTransactionId } = req.body;

    if (!farmerId || !buyerId || !cropName || !price || !quantity || !startDate || !endDate || !advancedTransactionId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const tx = await myContract["createDeal"](
            farmerId,
            buyerId,
            cropName,
            price,
            quantity,
            startDate,
            endDate,
            advancedTransactionId
        );
        console.log("Transaction sent: ", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed: ", receipt);
        res.status(200).json({ message: "Deal created successfully.", transactionHash: tx.hash });
    } catch (err) {
        console.error("Error creating deal: ", err);
        res.status(500).json({ error: "Failed to create deal.", details: err.message });
    }
});

app.get("/getDeal/:farmerId/:buyerId", async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const buyerId = req.params.buyerId;

        let dealsFound = [];

        // Iterate through all deals to find the matching farmerId and buyerId
        for (let i = 1; i <= await myContract.dealCount(); i++) {
            const deal = await myContract.getDeal(i);
            if (deal[0] === farmerId && deal[1] === buyerId) { // deal[0] is farmerId, deal[1] is buyerId
                dealsFound.push({
                    dealId: i,
                    farmerId: deal[0],
                    buyerId: deal[1],
                    cropName: deal[2],
                    price: deal[3].toString(),
                    quantity: deal[4].toString(),
                    startDate: deal[5],
                    endDate: deal[6],
                    status: deal[7],
                    advancedTransactionId: deal[8],
                    paymentTransactionId: deal[9]
                });
            }
        }

        if (dealsFound.length === 0) {
            return res.status(404).json({ error: "No deals found for the provided farmerId and buyerId." });
        }

        res.status(200).json({ message: "Deals found.", deals: dealsFound });
    } catch (err) {
        console.error("Error getting deal: ", err);
        res.status(500).json({ error: "Failed to get deal.", details: err.message });
    }
});

// Add a GET route for the root URL
app.get("/", (req, res) => {
    res.send("Welcome to the Kisan Mitra API! Use POST requests to interact with the /createDeal and /markAsCompleted endpoints.");
});

// app.get("/getDeals", async (req, res) => {
//
// })
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const baseURL = `http://localhost:${PORT}`;
    console.log(`Server running on port ${baseURL}`);
});
