import app from "./app";
import { connectDB } from "./config/database";
import { ENV } from "./config/env";

const startServer = async (): Promise<void> => {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Only start listening if DB connection succeeded
  app.listen(ENV.PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║     Mirza Footwear Backend is running     ║
    ║     Port     : ${ENV.PORT}                       ║
    ║     Mode     : ${ENV.NODE_ENV}                ║
    ║     Health   : /health                    ║
    ╚═══════════════════════════════════════════╝
    `);
  });
};

// ─── Handle unexpected crashes ────────────────────────────────────
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();