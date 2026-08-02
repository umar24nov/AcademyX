import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { institutesRouter } from "./routes/institutes.routes";
import { coursesRouter } from "./routes/courses.routes";
import { batchesRouter } from "./routes/batches.routes";
import { studentsRouter } from "./routes/students.routes";
import { teachersRouter } from "./routes/teachers.routes";
import { examsRouter } from "./routes/exams.routes";
import { assignmentsRouter } from "./routes/assignments.routes";
import { paymentsRouter } from "./routes/payments.routes";
import { messagesRouter } from "./routes/messages.routes";
import { notificationsRouter } from "./routes/notifications.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { liveClassesRouter } from "./routes/live-classes.routes";
import { lecturesRouter } from "./routes/lectures.routes";
import { reportsRouter } from "./routes/reports.routes";
import { notFoundHandler, errorHandler } from "./middleware/error";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: { status: "ok", service: "academyx-api", timestamp: new Date().toISOString() },
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/institutes", institutesRouter);
  app.use("/api/v1/courses", coursesRouter);
  app.use("/api/v1/batches", batchesRouter);
  app.use("/api/v1/students", studentsRouter);
  app.use("/api/v1/teachers", teachersRouter);
  app.use("/api/v1/exams", examsRouter);
  app.use("/api/v1/assignments", assignmentsRouter);
  app.use("/api/v1/payments", paymentsRouter);
  app.use("/api/v1/messages", messagesRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/live-classes", liveClassesRouter);
  app.use("/api/v1/lectures", lecturesRouter);
  app.use("/api/v1/reports", reportsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
