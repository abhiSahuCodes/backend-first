import User from "../models/user.schema.js";
import JWT from "jsonwebtoken";
import asyncHandler from "../service/asyncHandler.js";
import config from "../config.js";
import CustomError from "../utils/CustomError.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
    let token;

    //if the token is available then save it in the token
    //Also send the token with authorization header
    if (req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))) {
        // token here will be like, token = "Bearer ghlflsfjsdlflsdf"
        token = req.cookies.token || req.headers.authorization.split(" ")[1]
        //split[0] will be Bearer
    }

    if (!token) {
        throw new CustomError("Not authorized to access the resource", 401)
    }

    //After taking the token (something might give error if somebody is playing)
    try {
        const decodedJWTPayload = JWT.verify(token, config.JWT_SECRET)
        req.user = await User.findById(decodedJWTPayload._id, "name email role")
        next()
    } catch (error) {
        throw new CustomError("Not authorized to access the resource", 401)
    }
})

//To check what role is that person is playing(whether user/admin)
//Use this after login as we won't have req if not loggedin 
export const authorize = (...requiredRoles) => asyncHandler(async(req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
        throw new CustomError("You are not authorized to access this resource")
    }
    next()
})