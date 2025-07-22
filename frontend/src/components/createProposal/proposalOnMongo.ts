type SaveProposalArgs = {
  proposalCreator : string;
  proposalCreatedAt : Date;
  proposalExpiry : Date;
  proposalTitle : string;
  proposalOptions : string[];
  proposalHash : string;
}

type ProposalOnMongoResponse = SaveProposalArgs & { _id: string, __v?: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function proposalOnMongo(proposal: SaveProposalArgs): Promise<ProposalOnMongoResponse> {
  const response = await fetch(`${API_URL}/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(proposal),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save proposal to DB");
  }
  return response.json();
}

export default proposalOnMongo;