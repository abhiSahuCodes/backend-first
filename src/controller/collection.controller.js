import  Collection  from "../models/collection.schema";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/CustomError.js";


export const createCollection = asyncHandler(async (req, res) => {
    //User needs to give a name to create the collection
    //The name can be retrieved from req.body
    const {name} = req.body

    if (!name) {
        throw new CustomError("Collection name is required", 400)
    }

    const collection = await Collection.create({
        name
    })

    //After the creation of the collection lets give it to the user
    res.status(200).json({
        success: true,
        message: "The collection was created succesfully",
        collection
    })
})

//Updating the collection

export const updateCollection = asyncHandler(async (req, res) => {

    const {name} = req.body
    //Here we need the id for that particular collection to update
    //We can extract it from route url(here params)
    const {id: collectionId} = req.params

    if (!name) {
        throw new CustomError("Collection name is required", 400)
    }

    let updatedCollection = await Collection.findByIdAndUpdate(collectionId, {
        // name: name (name should be updated)
        name
    }, {
        //It will give the new collection only after update
        new: true,
        //We should run validators like maxLength given before
        runValidators: true
    })

    //If updateCollection doesnot happen
    if (!updateCollection) {
        throw new CustomError("Collection not found", 400)
    }

    //After the updation of the collection, lets give it to the user
    res.status(200).json({
        success: true,
        message: "The collection was updated succesfully",
        updatedCollection
    })
})


//Deleting the collection

export const deleteCollection = asyncHandler(async (req, res) => {

    //Here we need the id for that particular collection to delete
    //We can extract it from route url(here params)
    const {id: collectionId} = req.params

    const collectionToDelete = await Collection.findById(collectionId)

    //If collectionToDelete is not found
    if (!collectionToDelete) {
        throw new CustomError("Collection to be deleted was not found", 400)
    }

    //If found
    await collectionToDelete.remove()

    //We can also use Collection.findByIdAndDelete like incase of update

    //After the deletion of the collection, lets give it to the user
    res.status(200).json({
        success: true,
        message: "The collection was deleted succesfully",
        collectionToDelete
    })
})


//Getting all the collections

export const getAllCollection = asyncHandler(async (req, res) => {

    const collections = await Collection.find({})

    //If collections is not found
    if (!collections) {
        throw new CustomError("No collections found", 400)
    }

    //After getting collections, lets give it to the user
    res.status(200).json({
        success: true,
        collections
    })
})