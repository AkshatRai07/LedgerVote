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
  return (
    <div>ProposalCard</div>
  )
}

export default ProposalCard