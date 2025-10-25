
const monngoose = require('mongoose');

const refreshTokenSchema = new monngoose.Schema({
    token:{
        type: String,
        required: true,
        unique: true
    },
    user:{
        type: monngoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    }
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = monngoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
// This code defines a Mongoose schema for a RefreshToken model, which includes fields for the token, user reference, and expiration time.
// The index ensures that tokens are automatically removed from the database after they expire.
// This schema is used to manage refresh tokens in an identity service, allowing users to obtain new access tokens without re-authenticating.
// The `expiresAt` field is indexed to automatically delete expired tokens, ensuring efficient token management.
// The `user` field references the User model, linking each refresh token to a specific user.
// The `token` field is unique, ensuring that each refresh token is distinct.   

