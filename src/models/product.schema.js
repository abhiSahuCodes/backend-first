import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: ["true", "Please provide a product name"],
        trim: true,
        maxLength: [120, "The product name should not exceed 120 characters"]
    },
    price: {
        type: Number,
        required: ["true", "Please provide the price of the product"],
        trim: true,
        maxLength: [5, "The product price should not exceed 5 characters"]
    },
    description: {
        type: String
    },
    photos: [
        {
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    stock: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection"
    }
}, {timestamps: true})

export default mongoose.model("Product", productSchema)