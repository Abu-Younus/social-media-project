import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import multer from "multer";
import fileUpload from "express-fileupload";
import router from "./routes/api.js";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import {
  CLIENT_URL,
  DATABASE,
  MAX_JSON_SIZE,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE,
} from "./app/config/config.js";

const app = express();

// App Use Default Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.use(helmet());
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cookieParser());
app.use(fileUpload());

// App Use Limiter
const limiter = rateLimit({ windowMs: REQUEST_TIME, max: REQUEST_NUMBER });
app.use(limiter);

// Cache
app.set("etag", WEB_CACHE);

// Database Connect
mongoose
  .connect(DATABASE, { autoIndex: true })
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Database disconnected");
  });

//router
app.use("/api", router);

// app.use(express.static('client/dist'));

// // Add React Front End Routing
// app.get('*',function (req,res) {
//     res.sendFile(path.resolve(__dirname,'client','dist','index.html'))
// })

//404 route
app.use("*", (req, res) => {
  res
    .status(404)
    .json({
      status: "Not Found",
      data: "Your requested resource is not found!",
    });
});

export default app;
