import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index.js";

//Install express, mongoose, and dotenv in one go (npm install express mongoose dotenv)

( async () => {
    try {
        // await mongoose.connect("mongodb://localhost:27017/ecomm")
        await mongoose.connect(config.MONGODB_URL)
        console.log("DB Connected!")

        app.on('error', (err) => {
            console.error("ERROR: ", err);
            throw err
        })

        const onListening = () => {
            console.log(`Listening on port ${config.PORT}`)
        }

        // app.listen(5000, onListening)
        app.listen(config.PORT, onListening)

    } catch (err) {
        console.error("ERROR: ", err)
        throw err
    }
}) ()