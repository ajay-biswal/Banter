import express, { type Application} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { csrfMiddleware } from "./middlewares/csrf.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app: Application = express();
app.use(
  cors({
    origin: "http://localhost:3000", // 👈 exact frontend origin
    credentials: true,               // 👈 REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); // Add cookie parser middleware
app.use(csrfMiddleware); // Add CSRF middleware after cookie parser
app.use('/api', routes); // Mount all routes under /api
app.use(errorHandler);


export default app;