import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Proposal = {
  _id : string;
  proposalCreator : string;
  proposalCreatedAt : Date;
  proposalExpiry : Date;
  proposalTitle : string;
  proposalOptions : string[];
  proposalHash : string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id;

  const [proposal, setProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/proposals/id/${proposalId}`)
      .then(res => res.json())
      .then(setProposal);
  }, [proposalId]);

  return <div>Proposal ID: {proposalId}</div>;
}
