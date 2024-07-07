const { Blog } = require('../../db/db_config');

module.exports = {
    addBlogService: (title, content, creator, tags, categories, callback) => {
        let newBlog = new Blog({
            title,
            content,
            tags,
            categories,
            creator,
        });
        newBlog.save()
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback(err, null);
            });
    },

    getBlogByIdService: (blogId, callback) => {
        Blog.findById(blogId)
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback({ err: "Could not find Blog" }, null);
            });
    },

    deleteBlogService: (blogId, callback) => {
        console.log('Deleting blog with ID:', blogId);
        Blog.deleteOne({ _id: blogId })
            .then((deleted) => {
                callback(null, deleted);
            })
            .catch((err) => {
                console.error(err);
                callback({ err: "Could not find Blog" }, null);
            });
    },

    addLikesService: async (blog, callback) => {
        blog.likes += 1;
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
    }
}