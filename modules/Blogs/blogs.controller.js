const { Blog, User } = require('../../db/db_config');
const
    { addBlogService, getBlogByIdService, deleteBlogService, addLikesService, addCommentsService }
        = require('./blogs.service');

const uuid = require('uuid').v4;
const fs = require('fs');

const mongoose = require('mongoose');

module.exports = {
    getBlogs: (req, res) => {
        Blog.find({}).then((blogs) => {
            res.json(blogs);
        })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Error fetching Blogs' });
            });
    },
    addBlog: async (req, res) => {
        const { title, content, creator, tags, categories } = req.body;

        if (!title || !content || !creator || !tags || !categories) {
            return res.status(400).json("Missing data fields! Could not create blog");
        }

        try {
            const user = await User.findById(creator);
            if (!user) {
                return res.status(404).json("User not found");
            }

            addBlogService(title, content, creator, tags, categories, (err, result) => {
                if (err) {
                    return res.status(500).send({ error: err });
                } else {
                    user.blogs.push(result._id);
                    user.save().
                        then(() => {
                            res.status(201).send(result);
                        })
                        .catch((err) => {
                            res.status(500).send({ error: 'Save Error' })
                        });
                }
            });
        }
        catch (err) {
            return res.status(500).send({ error: err.message });
        }

    },

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

    deleteBlog: async (req, res, next) => {
        const blogId = new mongoose.Types.ObjectId(req.params.blogId);
        // const blogId=req.params.blogId;

        let blog;
        try {
            blog = await Place.findById(blogId).populate('creator');
        } catch (err) {
            // const error = new HttpError(
            //     'Something went wrong, could not delete place.',
            //     500
            // );
            // return next(error);
            return res.status(400).send({ error: err });
        }

        if (!blog) {
            // const error = new HttpError("Could not find a place with that id.", 404);
            // return next(error);
            return res.status(400).send({ error: err });
        }
    
        if(blog.creator.id !== req.blogId){
            // const error = new HttpError( 'You do not have access to this API feature (deleting).', 401 )
            // return next(error);
            return res.status(400).send({ error: 'You do not have access to this API feature (deleting)' });
        }

        const imagePath = blog.image;
        fs.unlink(imagePath, err => {
            console.log(err);
        });

        deleteBlogService(blogId, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json({ message: 'Successfully Deleted' });
            }
        })
    },

    addLikes: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }

            addLikesService(blog, (err, result) => {
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
            const blog = await Blog.findById(req.params.id);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            const { name, comment } = req.body;
            if (!name || !comment) {
                return res.status(400).json({ error: 'Missing data fields' });
            }

            addCommentsService(blog, name, comment, (err, result) => {
                if (err) {
                    return res.status(304).send({ error: err });
                }
                else {
                    return res.status(200).json(result);
                }
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}