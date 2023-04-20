import formidable from "formidable";
import Product from "../models/product.schema.js";
import { s3FileDelete, s3FileUpload } from "../service/imageUpload.js";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import config from "../config/index.js";
import Mongoose from "mongoose";
import fs from "fs";

/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can create the coupon
 * @descriptio Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/


export const addProduct = asyncHandler(async (req, res) => {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async function (err, fields, files) {
        if (err) {
            throw new CustomError(err.message || "Something went wrong", 500)
        }
    })

    let productId = new Mongoose.Types.ObjectId().toHexString()

    // `products/${productId}/photo_3.`

    // console.log(fields, files)

    if (
        !fields.name ||
        !fields.price ||
        !fields.description ||
        !fields.collectionId
    ) {
        throw new CustomError("Please, fill all the fields", 500)
    }

    //Image Array Response
    let imageArrayResp= Promise.all(
        Object.keys(files).map(async (file, index) => {
            const element = file[fileKey]
            console.log(element)
            const data = fs.readFileSync(element.filepath) 

            //Now uploading it
            const upload = await s3FileUpload({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${productId}/photo_${index + 1}.png`,
                body: data,
                contentType: element.mimetype

                //If productId = 123abc456
                //1: products/123abc456/photo_1.png
            })
            console.log(upload);
            return {
                secure_url: upload
            }
        })
    )
    let imageArray = await imageArrayResp

    const product = await Product.create({
        _id: productId,
        photos: imageArray,
        ...fields
    })

    if(!product) {
        throw new CustomError("Product failed to be created in DB", 400)
    }

    res.status(200).json({
        success: true,
        product
    })

    //We can wrap all this from const form inside a try catch incase we think it
    //might cause an error while uploading the file or during any other such event.

    //File path is temporary. As soon as it gets uploaded, it is gone.
})

export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})

//Getting one product

export const getProductById = asyncHandler(async (res, req) => {
    //we can get url from params and we can get id from there
    const {id: productId} = req.params

    const product = await product.findById(productId)

    if (!product) {
        throw new CustomError("No such product found", 404)
    }

    res.status(200).json({
        success: true,
        product
    })
})

//Getting products from collectionId

export const getProductByCollectionId = asyncHandler(async (res, req) => {
    const {id: collectionId} = req.params

    const products= await Product.find(collectionId) 

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})

//Deleting the product
//Some challanges during this: we cannot do only product.remove()
//As this won't delete the photos
//For that we need to resolve the promise
//For that we need the key

export const deleteProduct = asyncHandler(async (res, req) => {
    const {id: productId} = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No such product found", 404)
    }

    //Resolving promise
    //Loop through photos array => delete each photo
    //key: product._id
    //Recreate the entire path

    const deletePhotos = Promise.all(
        product.photos.map(async (elem, index) => {
            await s3FileDelete({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${product._id.toString()}/photos_${index + 1}.png`
            })
        })
    )
    await deletePhotos;
    await product.remove();

    res.status(200).json({
        success: true,
        message: "The product is deleted successfully"
    })
})

