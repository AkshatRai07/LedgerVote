// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ballot {

    uint256 public defaultMinValueToVote;
    uint256 public minValueToCreateProposal;
    address public owner;

    struct Proposal {
        address creator;
        uint256 proposalCreatedAt;
        uint256 proposalExpiry;
        uint256 minValueToVote;
        bytes32 proposalHash;
    }

    Proposal[] public proposals;

    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => mapping(address => uint256)) public choiceVoted;
    mapping(bytes32 => mapping(uint256 => uint256)) public votesPerChoice;
    mapping(bytes32 => Proposal) public proposalByHash; // Avoiding dirty loops

    event ProposalCreated(
        address creator,
        uint256 proposalCreatedAt,
        uint256 proposalExpiry,
        uint256 minValueToVote,
        bytes32 proposalHash
    );

    event VoteCasted(
        address caster,
        bytes32 proposalHash,
        uint256 choice
    );

    constructor() {
        owner = msg.sender;
        defaultMinValueToVote = 0.005 ether;
        minValueToCreateProposal = 0.01 ether;
    }

    function createProposal(uint256 _proposalExpiry, uint256 _minValueToVote, bytes32 _proposalHash) public payable {
        require(_proposalExpiry > block.timestamp, "Impossible expiry time");
        require(msg.value >= minValueToCreateProposal, "Not enough amount to create proposal");

        if (_minValueToVote == 0) {
            _minValueToVote = defaultMinValueToVote;
        }

        Proposal memory proposalToAdd = Proposal(
            msg.sender,
            block.timestamp,
            _proposalExpiry,
            _minValueToVote,
            _proposalHash
        );

        proposals.push(proposalToAdd);

        proposalByHash[_proposalHash] = proposalToAdd;

        emit ProposalCreated(
            msg.sender,
            block.timestamp,
            _proposalExpiry,
            _minValueToVote,
            _proposalHash
        );
    }

    function casteVote(bytes32 _proposalHash, uint256 _choice) public payable {
        Proposal memory reqProposal = proposalByHash[_proposalHash];

        require(reqProposal.proposalCreatedAt > 0, "Not a valid proposal");
        require(block.timestamp < reqProposal.proposalExpiry, "Voting period is over");
        require(msg.value >= reqProposal.minValueToVote, "Not enough amount to vote");

        if (!hasVoted[_proposalHash][msg.sender]) {
            choiceVoted[_proposalHash][msg.sender] = _choice;
            votesPerChoice[_proposalHash][_choice] += 1;
            hasVoted[_proposalHash][msg.sender] = true;
        } else {
            uint256 oldChoice = choiceVoted[_proposalHash][msg.sender];
            if (!(_choice == oldChoice)) {
                choiceVoted[_proposalHash][msg.sender] = _choice;
                votesPerChoice[_proposalHash][_choice] += 1;
                votesPerChoice[_proposalHash][oldChoice] -= 1;
            }
        }

        emit VoteCasted(
            msg.sender,
            _proposalHash,
            _choice
        );
    }

    function withdraw() external {
        require(msg.sender == owner, "Not the owner");
        (bool success,) = payable(msg.sender).call{ value : address(this).balance }("");
        require(success, "Transfer unsuccessful");
    }
}
