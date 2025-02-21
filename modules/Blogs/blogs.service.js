const { Blog } = require('../../db/db_config');
const mongoose = require('mongoose');

module.exports = {
    addBlogService: async (title, content, tags, categories, img, user) => {
        const newBlog = new Blog({
            title,
            content,
            creator: user.id,
            tags: JSON.parse(tags),
            categories: JSON.parse(categories),
            image: img,
            likes: 0,
            comments: [],
            creatorName: user.name
        });
        const sess = await mongoose.startSession();
        sess.startTransaction();
        try {
            await newBlog.save({ session: sess });
            user.blogs.push(newBlog);
            await user.save({ session: sess });
            await sess.commitTransaction();
            return newBlog;
        } catch (err) {
            await sess.abortTransaction();
            throw new Error("Could not create blog");
        }
    },

    deleteBlogService: async (blog) => {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        try {
            await Blog.deleteOne({ _id: blog.id }, { session: sess });
            blog.creator.blogs.pull(blog);
            await blog.creator.save({ session: sess });
            await sess.commitTransaction();
            return "Successfully Deleted";
        } catch (err) {
            await sess.abortTransaction();
            throw new Error("Could not delete blog");
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

    addCommentsService: async (blog, name, comment) => {
        try {
            blog.comments.push({ name, comment });
            const updatedBlog = await blog.save();
            return updatedBlog;
        } catch (err) {
            return err;
        }
    },


    deleteCommentService: async (blog, commentId, callback) => {
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