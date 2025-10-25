
const express = require('express');
const { registerUser, loginUser, userRefreshToken, logoutUser } = require('../controllers/identity-controller'); 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', userRefreshToken);
router.post('/logoutUser', logoutUser);


module.exports = router;


