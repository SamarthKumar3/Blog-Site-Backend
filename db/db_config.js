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
        required: true
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
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
        default: 0
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema]
    // comments: [{
    //     id: {
    //         _id: uuid(),
    //         type: Schema.Types.ObjectId,
    //     },
    //     name: {
    //         type: String,
    //         required: true
    //     },
    //     comment: {
    //         type: String,
    //         required: true
    //     }
    // }],
},
    {
        timestamps: true
    }

);

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
    profilePic: {
        type: String,
    },
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}
);

userSchema.plugin(uniqueValidator);

module.exports.Blog = mongoose.model('Blog', blogSchema);
module.exports.User = mongoose.model('User', userSchema);
