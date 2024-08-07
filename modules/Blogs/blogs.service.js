const { Blog } = require('../../db/db_config');

module.exports = {
    addBlogService: async (title, content, userId, tags, categories, img, callback) => {
        let newBlog = new Blog({
            title,
            content,
            creator: userId,
            tags: JSON.parse(tags),
            categories: JSON.parse(categories),
            image: img,
            likes: 0,
            comments: []
        });
        await newBlog.save()
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback(err, null);
            });

    },

    getBlogByIdService: async (blogId, callback) => {
        await Blog.findById(blogId)
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback({ err: "Could not find Blog" }, null);
            });
    },

    deleteBlogService: async (blogId, callback) => {
        console.log('Deleting blog with ID:', blogId);
        await Blog.deleteOne({ _id: blogId })
            .then((deleted) => {
                callback(null, deleted);
            })
            .catch((err) => {
                console.error(err);
                callback({ err: "Could not find Blog" }, null);
            });
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