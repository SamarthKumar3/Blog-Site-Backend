const { Blog, User } = require('../../db/db_config');
const
    { addBlogService, getBlogByIdService, deleteBlogService, addLikesService, addCommentsService, deleteCommentService }
        = require('./blogs.service');

const uuid = require('uuid').v4;
const fs = require('fs');
const HttpError = require('../../middleware/http-error');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

module.exports = {
    getBlogById: (req, res) => {
        const blogId = req.params.blogId;

        getBlogByIdService(blogId, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json(result);
            }
        })

    },
    getBlogs: async (req, res, next) => {
        let blogs;
        try {
            blogs = await Blog.find({});
        }
        catch (err) {
            const error = new HttpError('Could not fetch blogs', 500);
            return res.status(500).send({ error: err });
        }
        if (!blogs) {
            const error = new HttpError('No blogs found', 404);
            return next(error);
        }
        res.json({ blogs: blogs.map(blog => blog.toObject({ getters: true })) });
    },

    addBlog: async (req, res, next) => {
        const errors = validationResult(req);
        const { title, content, tags, categories } = req.body;
        if (!errors.isEmpty()) {
            return next(new HttpError('Invalid inputs passed, please check your data', 422));
        }
        // const img = 'https://preview.redd.it/about-gojos-unlimited-void-v0-tpkax14ukz7c1.png?width=840&format=png&auto=webp&s=b6c464711bc6ee97b4f50118c64fbf51544d6c7d'
        // const img = 'https://images7.alphacoders.com/131/1318705.png'

        const img = req.file.path;
        if (!img) {
            return res.status(400).json("Missing Image");
        }
        let user;
        try {
            user = await User.findById(req.userData.userId);
        }
        catch (err) {
            const error = new HttpError('Could not find user', 500);
            return next(error);
        }

        if (!user) {
            const error = new HttpError('Could not find user for provided id', 404);
            return next(error);
        }

        addBlogService(title, content, tags, categories, img, user, (err, result) => {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(201).json({ blog: result });
            }
        });
    },

    deleteBlog: async (req, res, next) => {
        const blogId = req.params.blogId;

        let blog;
        try {
            blog = await Blog.findById(blogId).populate('creator');
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not delete place.',
                500
            );
            return next(error);
        }

        if (!blog) {
            const error = new HttpError("Could not find a place with that id.", 404);
            return next(error);
        }
        console.log(blog.creator.id);

        if (blog.creator.id !== req.userData.userId) {
            const error = new HttpError('You do not have access to this API feature (deleting).', 401)
            return next(error);
        }

        deleteBlogService(blog, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json({ message: 'Successfully Deleted' });
            }
        });
        const imagePath = blog.image;
        fs.unlink(imagePath, err => {
            console.log(err);
        });
    },

    addLikes: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.blogId);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            // // add user id to the request body // //
            // // dont let the user to like the blog more than once // //
            const userId = req.body.userId;
            if (blog.likedBy.includes(userId)) {
                return res.status(400).json({ error: 'User has already liked this post' });
            }

            addLikesService(blog, userId, (err, result) => {
                if (err) {
                    return res.status(304).send({ error: err });
                }
                else {
                    return res.status(200).json({ likes: result.likes });
                }
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    addComments: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.blogId);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            const { userId, comment } = req.body;

            let existingUser = await User.findById(userId);

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!comment) {
                return res.status(400).json({ error: 'Missing data fields' });
            }
            const updatedBlog = await addCommentsService(blog, existingUser.name, comment);
            return res.status(200).json(updatedBlog);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { commentId, blogId } = req.params;
            const currUser = req.userData.userId;

            if (!mongoose.Types.ObjectId.isValid(blogId) || !mongoose.Types.ObjectId.isValid(commentId)) {
                return res.status(400).json({ error: 'Invalid blog ID or comment ID' });
            }

            const blog = await Blog.findById(blogId);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }

            const comment = blog.comments.id(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            blogOwner = blog.creator.toString();

            if (currUser !== blogOwner) {
                return res.status(403).json({ error: 'Unauthorized action' }); 
            }

            deleteCommentService(blog, commentId, (err, result) => {
                if (err) {
                    return res.status(304).send({ error: err });
                }
                else {
                    return res.status(200).json({ "Success": "Comment Deleted" });
                }
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }
}