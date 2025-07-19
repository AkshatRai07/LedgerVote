import express from "express";
import cors from "cors";
import dbConnect from "./dbConnect";
import ProposalModel from "./proposalSchema";
const app = express()

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
}

dbConnect()
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch(console.error)

app.use(cors(corsOptions))

app.use(express.json())

app.get("/proposals", async (req, res) => {
  try {
    const { sortBy = "proposalCreatedAt", order = "desc" } = req.query
    const sortOrder = order === "asc" ? 1 : -1
    const proposals = await ProposalModel.find().sort({
      [sortBy as string]: sortOrder,
    })
    res.json(proposals)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
})

app.get("/proposals/creator/:creator", async (req, res) => {
  try {
    const { sortBy = "proposalCreatedAt", order = "desc" } = req.query
    const sortOrder = order === "asc" ? 1 : -1
    const creator = req.params.creator
    const proposals = await ProposalModel.find({ proposalCreator: creator })
      .sort({ [sortBy as string]: sortOrder })
    res.json(proposals)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
})

app.get("/proposals/expired", async (req, res) => {
  try {
    const { sortBy = "proposalExpiry", order = "asc" } = req.query
    const sortOrder = order === "asc" ? 1 : -1
    const now = new Date()
    const proposals = await ProposalModel.find({ proposalExpiry: { $lt: now } })
      .sort({ [sortBy as string]: sortOrder })
    res.json(proposals)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
})

app.get("/proposals/active", async (req, res) => {
  try {
    const { sortBy = "proposalExpiry", order = "asc" } = req.query;
    const sortOrder = order === "asc" ? 1 : -1;
    const now = new Date();
    const proposals = await ProposalModel.find({ proposalExpiry: { $gte: now } })
      .sort({ [sortBy as string]: sortOrder });
    res.json(proposals);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
});

app.post("/proposals", async (req, res) => {
  try {
    const {
      proposalCreator,
      proposalCreatedAt,
      proposalExpiry,
      proposalTitle,
      proposalOptions,
      proposalHash,
    } = req.body;

    if (
      !proposalCreator ||
      !proposalExpiry ||
      !proposalTitle ||
      !proposalOptions ||
      !proposalHash
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const proposal = new ProposalModel({
      proposalCreator,
      proposalCreatedAt: proposalCreatedAt ? proposalCreatedAt : undefined, // use default value
      proposalExpiry,
      proposalTitle,
      proposalOptions,
      proposalHash,
    });
    await proposal.save();

    res.status(201).json(proposal);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
