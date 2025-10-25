require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const app = express();
const PORT = process.env.PORT || 3002;

//connect to database
mongoose
.connect(process.env.MONGODB_URL)
.then(() => logger.info('Connected to MongoDB'))
.catch((e)=> logger.error('Error connecting to MongoDB:', e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware 
app.use(helmet());
app.use(cors());
app.use(express.json());

//logger middleware
app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})

//DDoS protection -> rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
    .then(() => {
        next();
    })
    .catch(() => {
       logger.warn(`Request limit exceeded for IP: ${req.ip}`)
       res.status(429).json({success: false, message: 'Too many requests'})
    })
})

// Homework - implement Ip based rate limiting for sensitive endpoints
//IP based rate-limiting for sensitive endpoints
const sensitiveEndPointsLimiter =  rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req, res) => {
        logger.warn(`Sensitive endpoint request limit exceeded for IP: ${req.ip}`);
        res.status(429).json({success: false, message: 'Too many requests'});
    },
    store : new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })     
})

//route
app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, postRoutes);




//error handling
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`post service is running on port ${PORT}`);
}),

//unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));   
})

