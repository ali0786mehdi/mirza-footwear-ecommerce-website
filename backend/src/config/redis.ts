import { createClient } from "redis";
import { ENV } from "./env";

const redisClient = createClient({
  url: ENV.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

redisClient.connect().catch(console.error);

export default redisClient;