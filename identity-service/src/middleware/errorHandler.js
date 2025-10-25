
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
}

module.exports = errorHandler;
// This middleware logs the error stack and sends a JSON response with the error status and message.