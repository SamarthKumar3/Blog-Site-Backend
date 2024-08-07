const Router = require('express');
const { getBlogs, addBlog, getBlogById, deleteBlog, addLikes, addComments, deleteComment } = require('./blogs.controller');
const fileUpload = require('../../middleware/fileUpload');

const blogsRouter = Router();

blogsRouter.get('/all-blogs',getBlogs);

blogsRouter.get('/:blogId',getBlogById);

blogsRouter.post('/create/new',fileUpload.single('image') ,addBlog);

blogsRouter.patch('/likes/:blogId', addLikes);

blogsRouter.post('/comments/:blogId', addComments);

blogsRouter.delete('/comment/:commentId/delete/:blogId', deleteComment);

blogsRouter.delete('/delete/:blogId', deleteBlog);


//implement authorization route

module.exports = { blogsRouter };
