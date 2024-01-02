const blogSchema = require('../../db/db_config');
const { addBlogService, getBlogByIdService, deleteBlogService } = require('./blogs.service');
const mongoose = require('mongoose');

module.exports = {
    getBlogs: (req, res) => {
        blogSchema.find({}).then((blogs) => {
            res.json(blogs);
        })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Error fetching Blogs' });
            });
    },
    addBlog: (req, res) => {
        const { title, content, creator } = req.body;

        if (!title || !content || !creator) {
            return res.status(400).json("Missing data fields! Could not create blog");
        }

        addBlogService(title, content, creator, (err, result) => {
            if (err) {
                return res.status(500).send({ error: err });
            }
            else {
                return res.status(201).send(result);
            }
        })


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

    deleteBlog: (req, res) => {
        const blogId = new mongoose.Types.ObjectId(req.params.blogId);
        // const blogId=req.params.blogId;

        deleteBlogService(blogId, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json({ message: 'Successfully Deleted' });
            }
        })
    }
}