const { Blog } = require('../../db/db_config');
const mongoose = require('mongoose');
const HttpError = require('../../middleware/http-error');

module.exports = {
    addBlogService: async (title, content, tags, categories, img, user, callback) => {
        let newBlog = new Blog({
            title,
            content,
            creator: user.id,
            tags: JSON.parse(tags),
            // tags,
            // categories,
            categories: JSON.parse(categories),
            image: img,
            likes: 0,
            comments: [],
            creatorName: user.name
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await newBlog.save({ session: sess });
            user.blogs.push(newBlog);
            await user.save({ session: sess });
            await sess.commitTransaction();
            callback(null, newBlog);
        } catch (err) {
            console.log(err);
            callback(err, null);
        }

    },

    getBlogByIdService: async (blogId, callback) => {
        await Blog.findById(blogId)
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback({ message: "Could not find Blog" }, null);
            });
    },

    deleteBlogService: async (blog, callback) => {
        console.log('Deleting blog with ID:', blog.id);
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await Blog.deleteOne({ _id: blog.id }, { session: sess });
            blog.creator.blogs.pull(blog);
            await blog.creator.save({ session: sess });
            await sess.commitTransaction();
            callback(null, "Successfully Deleted");
        } catch (err) {
            console.log(err);
            callback(err, null);
        }
    },

    addLikesService: async (blog, userId, callback) => {
        blog.likes += 1;
        blog.likedBy.push(userId);
        await blog.save()
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback(err, null);
            });

    },

    addCommentsService: async (blog, name, comment, callback) => {
        blog.comments.push({ name, comment });
        await blog.save()
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback(err, null);
            });
    },

    deleteCommentService: async (blog, commentId, callback) => {
        const comment = blog.comments.id(commentId);
        if (!comment) {
            return callback(err, null);
        }

        blog.comments.pull(commentId);

        await blog.save()
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback(err, null);
            });
    }
}