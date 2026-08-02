require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const adminRoutes = require("./admin/routes/admin.routes");
const connectDB = require("./config/db");
const certificateRoutes = require("./routes/certificate.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const organizationRoutes = require("./routes/organization.routes");
const placementRoutes = require("./routes/placement.routes");
const blogRoutes = require("./routes/blog.routes");
const notesRoutes = require("./routes/notes.routes");
const seminarRoutes = require("./routes/seminar.routes");
const hiringRoutes = require("./routes/hiring.routes");
const settingsRoutes = require("./routes/settings.routes");
const galleryRoutes = require("./routes/gallery.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Needed for correct client IP detection behind proxy (important for rate limiting).
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  }),
);

const envOrigins = (process.env.CLIENT_URL || "*")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultAllowedOrigins = [
  "https://sssamacademy.com",
  "https://www.sssamacademy.com",
  "https://sudhirkr85.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5500",
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultAllowedOrigins]));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (process.env.CLIENT_URL === "*" || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, "");
      const originWithoutWww = cleanOrigin.replace("https://www.", "https://").replace("http://www.", "http://");
      const originWithWww = cleanOrigin.includes("://www.")
        ? cleanOrigin
        : cleanOrigin.replace("https://", "https://www.").replace("http://", "http://www.");

      if (
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes(originWithoutWww) ||
        allowedOrigins.includes(originWithWww) ||
        cleanOrigin.startsWith("https://sudhirkr85.github.io")
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control", "Pragma"],
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


app.get("/", (_req, res) => {
  return res.status(200).json({ success: true, message: "API is running." });
});

app.use("/api/admin", adminRoutes);

app.use("/api/certificate", certificateRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/seminar", seminarRoutes);
app.use("/api/hiring", hiringRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Attempting to connect to database...');
    const dbConnected = await connectDB();
    
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
      if (!dbConnected) {
        // eslint-disable-next-line no-console
        console.warn('Server running without database connection. Some features may not work.');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Server error:', error.message);
      process.exit(1);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = {
  app,
};
