const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.warn(`Access attempted without userId`);
    res.status(401).json({
      success: false,
      message: "Authentication required please continue with login !",
    });
  }

    req.user = { userId };
  next();
};

module.exports = { authenticateRequest };
