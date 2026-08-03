import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { initLiveSocket } from "./sockets/live-socket";

async function main() {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 AcademyX API listening on http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/health`);
  });

  initLiveSocket(server);
  console.log("📡 Live class sockets ready at /socket.io");

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
