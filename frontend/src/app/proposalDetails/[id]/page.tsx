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

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id;

  const [proposal, setProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/proposals/id/${proposalId}`)
      .then(res => res.json())
      .then(setProposal);
  }, [proposalId]);

  return <div>Proposal ID: {proposalId}</div>;
}
