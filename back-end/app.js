import dotenv from "dotenv";
dotenv.config();
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { readdirSync } from "fs";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors"
export const app = express();
export const port = process.env.PORT || 5001;

// expose folder uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(cors({
    origin: process.env.FRONT_END,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler)
const loadRoutes = async () => {
    for (const r of readdirSync("./routes")) {
        try {
            const routeModule = await import(`./routes/${r}`);
            if (routeModule.default) {
                app.use("/api", routeModule.default);
                console.log(`🛜 Loaded route: /api from ${r}`);
            }
        } catch (error) {
            console.error(`❌ Error loading route ${r}:`, error);
        }
    }
};

await loadRoutes();
