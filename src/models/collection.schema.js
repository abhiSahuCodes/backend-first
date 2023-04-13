import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: ["true", "Please provide a collection name"],
            trim: true,
            maxLength: [
                120,
                "Collection name should not be more than 120 characters"
            ]
        }
    },
    {timestamps: true}
)

export default mongoose.model("Collection", collectionSchema)

/* The above is the way schema is exported
The collectionSchema mentioned after the comma is the constant name
The name that is given inside the "", is the way the name is given to be
used in other modules starting with capital letter and in the database
it will be saved as collections. See the "C" became "c" and it is plural
now. */