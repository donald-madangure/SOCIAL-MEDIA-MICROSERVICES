require('dotenv').config();

const mongoose = require('mongoose');
const logger = require('./utils/logger');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');


const app = express();
const PORT = process.env.PORT || 3001;

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

//apply this sensitiveEndPointsLimiter to our routes
app.use('/api/auth/register', sensitiveEndPointsLimiter);

//Routes
app.use('/api/auth', routes);

//error handling
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Identity service is running on port ${PORT}`);
}),

//unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));   
})







