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
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Needed for correct client IP detection behind proxy (important for rate limiting).
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
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
