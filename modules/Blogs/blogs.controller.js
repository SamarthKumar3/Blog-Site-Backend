const { Blog, User } = require('../../db/db_config');
const
    { addBlogService, deleteBlogService, addLikesService, addCommentsService, deleteCommentService }
        = require('./blogs.service');

const fs = require('fs');
const HttpError = require('../../middleware/http-error');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

module.exports = {
    getBlogById: async (req, res) => {
        const blogId = req.params.blogId;

        try {
            const blog = await Blog.findById(blogId);
            if (!blog) {
                throw new HttpError('Could not find blog', 404);
            }
            try {
                blog.views += 1;
                await blog.save();
            } catch (err) {
                throw new HttpError("Error updating views", 500);
            }
            return res.json(blog);
        } catch (err) {
            if (err instanceof HttpError) {
                return res.status(err.code).json({ error: err.message });
            }
            return res.status(500).json({ error: "Server Error" });
        }
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
            blog = await Blog.findById(blogId).populate('users');
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not delete blog.',
                500
            );
            return next(error);
        }

        if (!blog) {
            const error = new HttpError("Could not find a blog with that id.", 404);
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
            const userId = req.body.userId;

            if (blog.likedBy.includes(userId)) {
                return res.status(400).json({ error: 'User has already liked this post' });
            }

            addLikesService(blog, userId, (err, result) => {
                if (err) {
                    return res.status(304).send({ error: err });
                }
                else {
                    return res.status(200).json({ "success": result.likes });
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

            if(comment.length < 5) {
                return res.status(400).json({ error: 'Comment must be at least 5 characters long' });
            }

            let existingUser = await User.findById(userId);

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!comment) {
                return res.status(400).json({ error: 'Missing data fields' });
            }
            // const updatedBlog = await addCommentsService(blog, existingUser.name, comment);
            const name = existingUser.name;
            blog.comments.push({ name, comment });
            const updatedBlog = await blog.save();
            return res.status(200).json({ updatedBlog, "Success": 'Comment added successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    getTrendingBlog: async (req, res) => {
        try {
            // const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const trendingBlogs = await Blog.find({
                // createdAt: { $gte: startDate },
            })
                .sort({ views: -1 })
                .limit(10);

            if (!trendingBlogs.length) {
                return res.status(404).json({ message: "No trending blogs found." });
            }
            return res.json(trendingBlogs);
        } catch (err) {
            console.error("Error fetching trending blogs:", err);
            return res.status(500).json({ error: "Server Error" });
        }
    },

    getTopBlog: async (req, res) => {
        try {
            const topBlogs = await Blog.aggregate([
                {
                    $addFields: {
                        ranking: {
                            $add: [
                                { $multiply: ["$likes", 0.5] },
                                { $multiply: ["$views", 0.2] },
                                { $multiply: [{ $size: "$comments" }, 0.3] }
                            ]
                        }
                    }
                },
                { $sort: { ranking: -1 } }, 
                { $limit: 10 } 
            ]);

            if (!topBlogs.length) {
                return res.status(404).json({ message: "No top blogs found" });
            }
            return res.json(topBlogs);
        } catch (err) {
            console.error("Error fetching top blogs:", err);
            return res.status(500).json({ error: "Server Error" });
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
    },
}