import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import config from "../config/index.js";
import crypto from "crypto"; //No separate installation required


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: ["true", "Name is required"],
        maxLength: [50, "The name should contain maximum of 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "The password must contain atleast 8 characters"],
        select: false
    },
    role: {
        type: String,
        enum: Object.values(AuthRoles),
        default: AuthRoles.USER
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date

}, {timestamps: true})

//Encrypting the password before saving using bcryptjs and HOOKS in mongoose:
//Install bcryptjs for this from npm----Arrow functions don't work here as 'this' is used
userSchema.pre('save', async function(next) {
    if (this.isModified("password")) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//As we have encrypted the password that would never match the given password
//For those to match, we need a custom method
userSchema.methods = {
    //compare password
    comparePassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password)
    }, 
    //When the password is matched, the user should get authorised to roam around inside the account - (Install jsonwebtoken form npm)
    //Generate JWT Token
    getJWTtoken: function() {
        JWT.sign({_id: this._id, role: this.role}, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRY
        })
    },
    //To generate forgot password token
    generateForgotPasswordToken: function() {
        const forgotToken = crypto.randomBytes(20).toString("hex");

        //Encrypting token generated by crypto
        this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(forgotToken)
        .digest("hex")

        //Time for token to expire
        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

        return forgotToken
    }

}



export default mongoose.model("User", userSchema)