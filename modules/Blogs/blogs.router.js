const Router = require('express');
const { getBlogs, addBlog, getBlogById, deleteBlog } = require('./blogs.controller');

const blogsRouter = Router();

blogsRouter.get('/all-blogs',getBlogs);

blogsRouter.get('/:blogId',getBlogById);

blogsRouter.post('/create/new', addBlog);

blogsRouter.delete('/delete/:blogId', deleteBlog);


module.exports = { blogsRouter };
