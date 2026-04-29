import server from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const startServer = server.listen(3000, async (err) => {
  if (err) {
    console.error(`Server startup error: ${err}`);
    return;
  }

  try {
    await connectDB();
    console.log("Server is active at http://localhost:3000");
  } catch (dbError) {
    console.error("Server started but database connection failed:", dbError);
  }
});

export default startServer;