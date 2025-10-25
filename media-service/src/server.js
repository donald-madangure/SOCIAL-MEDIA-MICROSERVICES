require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

const PORT = process.env.PORT || 3003;

//connect to database
mongoose
.connect(process.env.MONGODB_URL)
.then(() => logger.info('Connected to MongoDB'))
.catch((e)=> logger.error('Error connecting to MongoDB:', e));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

//logger middleware
app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})

// Homework - implement Ip based rate limiting for sensitive endpoints


app.use('/api/media', mediaRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Media Service running on port ${PORT}`);
});

//unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));   
})