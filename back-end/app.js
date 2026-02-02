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
import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

export const loadRoutes = async (app) => {
    const routesPath = path.join(__dirname, "routes");

    console.log("📂 Loading routes from:", routesPath);

    for (const file of readdirSync(routesPath)) {
        if (!file.endsWith(".js")) continue;

        const fullPath = path.join(routesPath, file);

        try {
            const routeModule = await import(
                pathToFileURL(fullPath).href
            );

            if (routeModule.default) {
                app.use("/api", routeModule.default);
                console.log(`🛜 Loaded: /api ← ${file}`);
            }
        } catch (err) {
            console.error(`❌ Failed to load ${file}`, err);
        }
    }
};
await loadRoutes(app);
