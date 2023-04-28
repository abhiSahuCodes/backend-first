import Coupon from "../models/coupon.schema.js";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/customError.js";

/**********************************************************
 * @CREATE_COUPON
 * @route https://localhost:5000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/

//Creating coupon
export const createCoupon = asyncHandler(async (req, res) => {
    const {code, discount} = req.body

    if (!code || discount) {
        throw new CustomError("Code and discount are required", 400)
    }

    //Check if code already exists
    const coupon = await Coupon.create({
        code,
        discount
    })

    res.status(200).json({
        success: true,
        message: "Coupon created successfully",
        coupon
    })
})

//Getting all coupons
export const getAllCoupons = asyncHandler( async (req, res) => {
    const allCoupons = await Coupon.find();

    if (!allCoupons) {
        throw new CustomError("No Coupons found", 400)
        
    }

    res.status(200).json({
        success: true,
        allCoupons
    })
    
})

//