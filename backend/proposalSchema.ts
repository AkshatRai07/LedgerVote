import mongoose, {Schema, Document} from "mongoose";

export interface Proposal extends Document {
    proposalCreator : string;
    proposalCreatedAt : Date;
    proposalExpiry : Date;
    proposalTitle : string;
    proposalOptions : string[];
    proposalHash : string;
}

const ProposalSchema : Schema<Proposal> = new Schema({
    proposalCreator : {
        type : String,
        required : true,
    },
    proposalCreatedAt : {
        type : Date,
        required : true,
        default : Date.now(),
    },
    proposalExpiry : {
        type : Date,
        required : true,
    },
    proposalTitle : {
        type : String,
        required : true,
    },
    proposalOptions : {
        type : [String],
        required : true,
    },
    proposalHash : {
        type : String,
        required : true,
    },
})

const ProposalModel = (mongoose.models.Proposal as mongoose.Model<Proposal>) || mongoose.model<Proposal>("Proposal", ProposalSchema)

export default ProposalModel