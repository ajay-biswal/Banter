import dotenv from "dotenv";
dotenv.config();
export const env = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV || "development",
    PASETO_SECRET: process.env.PASETO_SECRET,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    SOCKET_REDIS_ENABLED: process.env.SOCKET_REDIS_ENABLED || false
};
if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
}
//# sourceMappingURL=env.js.map