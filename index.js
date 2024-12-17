import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();

app.use(express.json()); // Parse JSON body
app.use(cors()); // Enable CORS

// MongoDB connection setup
const client = new MongoClient("mongodb+srv://Kapil:Nirvana1640@cluster0.sqxm0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1); 
    }
};


// Routes
app.get('/', (req, res) => {
    res.send("Hello");
});

//start negotiation
app.post("/negotiation/start", async (req, res) => {
    const { bemail, listingId, expectedPrice } = req.body;
    const db = client.db("test");
    const coll = db.collection("negotiation");
    const coll2 = db.collection("listings");
    if (!bemail || !listingId) {
        return res.status(400).json({ message: "Data required." });
    }
    const listing = await coll2.findOne({ _id: new ObjectId(listingId) }); // Replace with your collection name

    if (!listing) {
        return res.status(404).json({ message: "Listing not found." });
    }

    const femail = listing.email;

    try {
        const newNegotiation = {
            farmerid: femail,
            buyerid: bemail,
            listingid: listingId,
            messages: [
                {
                    sender: bemail,
                    price: expectedPrice,
                    timestamp: new Date()
                }
            ],
            farmeragree: false,
            buyeragree: false,
        };

        const result = await coll.insertOne(newNegotiation);

        res.status(201).json({ message: "Negotiation created successfully." });
    } catch (error) {
        console.error("Error creating negotiation:", error);
        res.status(500).json({ message: "Internal server error." });
    }

});

// view active or ongoing contracts
app.get('/activecontracts', async (req, res) => {
    try {
        const db = client.db("test");
        const coll = db.collection("contract");

        const { userId } = req.body;
        //console.log(userId);
        const data = await coll.find({
            $and: [
                { status: "Ongoing" },
                {
                    $or: [
                        { farmerId: userId }, // Contracts where the user is the farmer
                        { buyerId: userId }   // Contracts where the user is the buyer
                    ]
                }
            ]
        }).toArray();
        if (data.length === 0) {
            res.status(204).json({ message: "User have no ongoing contracts" });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }

})

// view old contracts
app.get('/oldcontract', async (req, res) => {
    try {
        const db = client.db("test");
        const coll = db.collection("contract");

        const { userId } = req.body;
        //console.log(userId);
        const data = await coll.find({
            $and: [
                { status: { $in: ["Completed", "Rejected"] } },
                {
                    $or: [
                        { farmerId: userId }, // Contracts where the user is the farmer
                        { buyerId: userId }   // Contracts where the user is the buyer
                    ]
                }
            ]
        }).toArray();
        if (data.length === 0) {
            res.status(204).json({ message: "User have no contracts completed" });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }

})

//fetch all listings
app.get('/marketall', async (req, res) => {
    try {
        const db = client.db("test");
        const coll = db.collection("listings");

        const data = await coll.find().toArray();
        if (data.length === 0) {
            res.status(204).json({ message: "No listings found" });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// after filtering
app.get('/marketplace', async (req, res) => {
    try {
        const db = client.db("test");
        const coll = db.collection("listings");

        const {croptype, district, state} = req.body;
        
        const query = {};
        if (croptype) query.croptype = croptype;
        if (district) query.fcity = district;
        if (state) query.fstate = state;
        //console.log('Query:', query);
        const data = await coll.find(query).toArray();

        if (data.length === 0) {
            res.status(204).json({ message: "No listings found" });
        } else {
            res.status(200).json(data);
        }

    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// for farmers to see their listings
app.get('/a/:email', async (req, res) => {
    try {
        //const {farmerId} = req.body;
        //const {email} = req.body; // Extract the farmer ID from the request body
        
        const { email } = req.params;
        const db = client.db("test");
        const coll = db.collection("listings"); // Initialize the 'users' collection

        const data = await coll.find({ femail: email }).toArray();
        if (data.length === 0) {
            res.status(204).json({ message: "No listing found for the user" });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// buyers can see the pre contract form filled by buyers
app.get('/viewpcr', async (req, res) => {
    try {
        const {buyerId} = req.body; 
        
        const coll = db.collection("precontractform"); 

        const data = await coll.find({ buyerId: String(buyerId) }).toArray();
        if (data.length === 0) {
            res.status(204).json({ message: "No pre-contract forms found" });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});




// Start the server
const PORT = 8000;

connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MONGO DB connection failed!", err);
    });