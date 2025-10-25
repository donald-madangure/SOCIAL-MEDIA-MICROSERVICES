const User = require('../models/User');
const { generateToken } = require('../utils/generateToken'); // Adjust the path if needed
const logger = require('../utils/logger');
const { validateRegistration, validateLogin  } = require('../utils/validation');
const RefreshToken = require('../models/RefreshToken');

//user registraion
const registerUser = async(req, res) =>{
    logger.info('Registration endpoint hit...');
    try{
        //validate the schema
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn('Validation error:', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            }); 
        }
        const { username, email, password } = req.body;

        let user = await User.findOne({ $or: [{ username }, { email }] });
        if(user){
            logger.warn('User already exists:');
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        user = new User({
            username,
            email,
            password
        });
        await user.save();
        logger.warn('User registered successfully:', user._id);

        const { accessToken, refreshToken } = await generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken,
            refreshToken
        });


    }catch(e){
        logger.error('Error during registration:', e);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

//user login
const loginUser = async(req, res) => {
    logger.info('Login endpoint hit...');
    try{
        const { error } = validateLogin(req.body); 
        if (error) {
            logger.warn('Validation error', error.details[0].message); 
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });                    
            } 
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if(!user){
                logger.warn('Invalid user');
                return res.status(404).json({
                    success: false,
                    message: 'Invalid credentials',
                    });
            }
            const isPasswordValid = await user.comparePassword(password);
            if(!isPasswordValid){
                logger.warn('Invalid password');
                return res.status(404).json({
                    success: false,
                    message: 'Invalid password',
                    });
            }

            const { accessToken, refreshToken } = await generateToken(user);
            res.json({
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken,
                userId : user._id                
            })
       
        
    }catch(e){
        logger.error('Error during login:', e);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

//refresh token
const userRefreshToken = async(req, res) => {
    logger.info('Refresh token endpoint hit...');
    try{
        const {refreshToken} = req.body;
        if(!refreshToken){
            logger.warn('Refresh token missing');
            return res.status(401).json({
                success: false,
                message: 'Refresh token missing'
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn('Invalid or expired refresh token');
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        const user = await User.findById(storedToken.user);
        if(!user){
            logger.warn('User not found');
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const { accessToken : newAccessToken, refreshToken : newRefreshToken } = await generateToken(user);

        //delete old refresh token
        await RefreshToken.deleteOne({ _id: storedToken._id });
        
        return res.json({
            success: true,
            message: 'Refresh token generated successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })      
     
    }catch(e){
        logger.error('Refresh token error occured :', e);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

//user logout
const logoutUser = async(req, res) => {
    logger.info('Logout endpoint hit...');
    try{        
        const { refreshToken } = req.body; 
        if(!refreshToken){
            logger.warn('Refresh token missing');
            return res.status(400).json({
                success: false,
                message: 'Refresh token missing'
            });
        }  
        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info('Refresh token deleted for logout');
        res.json({
            success: true,
            message: 'Logged out successful'
        });      

    }catch(e){
        logger.error('Error while logging out:', e);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
    })
    }
}

module.exports = {
    registerUser, 
    loginUser,
    userRefreshToken,
    logoutUser
};