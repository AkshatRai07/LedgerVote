import React from 'react'

type Proposal = {
  _id : string;
  proposalCreator : string;
  proposalCreatedAt : Date;
  proposalExpiry : Date;
  proposalTitle : string;
  proposalOptions : string[];
  proposalHash : string;
};

const ProposalCard = (proposal : Proposal) => {

  const ActivityCard = () => {
    if (new Date(proposal.proposalExpiry) > new Date()) {
      return <div className="text-green-500 font-sans font-semibold">Active</div>
    } else {
      return <div className="text-red-500 font-sans font-semibold">Expired</div>
    }
  }

  return (
    <div className="flex flex-col">
      <div className="font-semibold font-sans break-words">
        {proposal.proposalTitle}
      </div>
      <ActivityCard />
    </div>
  )
}

export default ProposalCard