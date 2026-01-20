import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { csrfMiddleware } from "./middlewares/csrf.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware
app.use(csrfMiddleware); // Add CSRF middleware after cookie parser
app.use('/api', routes); // Mount all routes under /api
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map