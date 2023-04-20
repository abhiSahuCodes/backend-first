import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js"

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())

app.use("/api/v1/", routes)
//app.use("/api", routes) can also be good

//When the page is opened:
app.get("/", (_req, res) => {
    res.send("Hello there Abhishek - API")
})

//If hitting any other route then:
app.all("*", (_req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found"
    })
})

export default app;

//Install Both
//cors(Cross-Origin Request Sharing)
//cookie-parser
//import from routes index.js---

//http://localhost:4000/api/v1/auth/login
//http://localhost:4000/api/v1/auth/logout
//http://localhost:4000/api/v1/auth/signup