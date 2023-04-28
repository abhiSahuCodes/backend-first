import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/CustomError";
import User from "../models/user.schema.js";
import mailHelper from "../utils/mailHelper";

//signup a new user

//securing cookie from user(user cannot write/edit) {httpOnly: true}
export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true
}

/******************************************************
 * @SIGNUP
 * @route http://localhost:5000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @returns User Object
 ******************************************************/

export const signUp = asyncHandler(async (req, res) => {
    //get data from user
    const { name, email, password } = req.body

    //validation
    if (!name || !email || !password) {
        // throw new Error("Requires fill") ---if no custom error was made
        // If using custom error, then:
        throw new CustomError("Please add all the fields", 400)
    }

    //Lets add this data to the database
    //Finding if the user exists
    const existingUser = await User.findOne({ email: email })
    //we can also write ({email}) as email is same as email name given

    if (existingUser) {
        throw new CustomError("User already exists", 400)
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const token = user.getJWTtoken()
    //safety
    user.password = undefined

    //store this token in user's cookie--needs cookieParser in app.js
    res.cookie("token", token, cookieOptions)

    //send back a response to the user
    res.status(200).json({
        success: true,
        token,
        user
    })

})

//User login

/*********************************************************
 * @LOGIN
 * @route http://localhost:5000/api/auth/login
 * @description User Login Controller for signing in the user
 * @returns User Object
 *********************************************************/


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    //Validation
    if (!email || !password) {
        throw new CustomError("Please fill all the details", 400)
    }

    const user = User.findOne({ email }).select("+password")
    //If email and password doesn't match
    if (!user) {
        throw new CustomError("Invalid credentials", 400)
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (isPasswordMatched) {
        const token = user.getJWTtoken()
        //as the user is holding the password, lets secure this
        user.password = undefined
        //store this token in user's cookie
        res.cookie("token", token, cookieOptions)
        //if user is inside a mobile app or for a mobile developer
        //send back a response to the user
        res.status(200).json({
            success: true,
            token,
            user //we can send user.email if only email is to be sent
        })
    }

    throw new CustomError("Password is incorrect", 400)
})

//User logout

/**********************************************************
 * @LOGOUT
 * @route http://localhost:5000/api/auth/logout
 * @description User Logout Controller for logging out the user
 * @description Removes token from cookies
 * @returns Success Message with "Logged Out"
 **********************************************************/

export const logout = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    //After logout send a message
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

//After the middleware is established


/**********************************************************
 * @GET_PROFILE
 * @route http://localhost:5000/api/auth/profile
 * @description check token in cookies, if present then returns user details
 * @returns Logged In User Details
 **********************************************************/

export const getProfile = asyncHandler(async (req, res) => {
    const { user } = req; //or we can write const user = req.user

    if (!user) {
        throw new CustomError("User not found", 401)
    }

    res.status(200).json({
        success: true,
        user
    })
})


//Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new CustomError("Email not found", 400)
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomError("User not found", 400)
    }

    const resetToken = user.generateForgotPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`

    const message = `Your password reset token is as follows \n\n ${resetUrl} \n\n if this was not requested by you, please ignore.`

    try {
        // const options = {}
        await mailHelper({
            email: user.email,
            subject: "Password reset mail",
            message
        })
    } catch (error) {
        //as it is the problem from the server/database side, we need to do these before throwing an error
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({ validateBeforeSave: false })

        throw new CustomError(error.message || "Email could not be sent", 500)
    }
})


//Reset password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token: resetToken } = req.params
    const { password, confirmPassword } = req.body

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new CustomError("Password reset token is invalid", 400)
    }

    user.password = password;
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    //optional

    const token = user.getJWTtoken()
    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        success: true,
        user 
    })
})
