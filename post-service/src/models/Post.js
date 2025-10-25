
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type: String,
        required: true,
        trim: true // Remove leading/trailing whitespace
    },
    mediaIds: [
        {
            type: String,
        }
    ],
}, {timestamps: true});

// Text index for full-text search capabilities
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;