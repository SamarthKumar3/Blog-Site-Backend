const blogSchema = require('../../db/db_config');

module.exports = {
    addBlogService: (title, content, creator, callback) => {
        let newBlog = new blogSchema({
            title,
            content,
            creator
        });
        newBlog.save().then((blog) => {
            callback(null, blog);
        })
            .catch((err) => {
                callback({ err: "Could not add blog" }, null);
            });
    },

    getBlogByIdService: (blogId, callback) => {
        blogSchema.findById(blogId)
            .then((blog) => {
                callback(null, blog);
            })
            .catch((err) => {
                callback({ err: "Could not find Blog" }, null);
            });
    },
    deleteBlogService: (blogId, callback) => {
        console.log('Deleting blog with ID:', blogId);
        blogSchema.deleteOne({ _id: blogId })
            .then((deleted) => {
                callback(null, deleted);
            })
            .catch((err) => {
                console.error(err);
                callback({ err: "Could not find Blog" }, null);
            });
    }

}