const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        minlength: 5
    }
}, {
    timestamps: true
});

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 20
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorName: {
        type: String,
    },
    tags: {
        type: [String],
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    image: {
        type: String
    },
    likes: {
        type: Number,
        default: 0,
        index: true
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: { type: Number, default: 0, index: true },
    comments: [commentSchema]
},
    {
        timestamps: true
    }

);

blogSchema.index({ "views": -1, "likes": -1 });

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        // required: true
    },
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {
    timestamps: true
}
);

userSchema.plugin(uniqueValidator);

module.exports.Blog = mongoose.model('Blog', blogSchema);
module.exports.User = mongoose.model('User', userSchema);
