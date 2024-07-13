const { Blog } = require('../../db/db_config');

module.exports = {
    addBlogService: async (title, content, userId, tags, categories,img, callback) => {
        let newBlog = new Blog({
            title,
            content,
            creator:userId,
            tags,
            categories,
            image: img,
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