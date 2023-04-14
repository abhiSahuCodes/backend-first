import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    product: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                count: Number,
                price: Number
            }
        ],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true        
    },
    amount: {
        type: Number,
        required: true
    },
    coupon: String,
    transactionId: String,
    status: {
        type: String,
        enum: ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"],
        //The better way would be to make a utils file and referencing it here like in role inside user.schema
        default: "ORDERED"
    }
}, {timestamps: true})

export default mongoose.model('Order', orderSchema)