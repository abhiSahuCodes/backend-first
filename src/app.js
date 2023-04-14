import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())

export default app;

//Install Both
//cors(Cross-Origin Request Sharing)
//cookie-parser