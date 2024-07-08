const Router = require('express');
const { getBlogs, addBlog, getBlogById, deleteBlog, addLikes, addComments } = require('./blogs.controller');
const fileUpload = require('../../middleware/fileUpload');

const blogsRouter = Router();

blogsRouter.get('/all-blogs',getBlogs);

blogsRouter.get('/:blogId',getBlogById);

blogsRouter.post('/create/new',fileUpload.single('image') ,addBlog);

blogsRouter.patch('/:blogId/likes', addLikes);

blogsRouter.patch('/:blogId/comments', addComments);

blogsRouter.delete('/delete/:blogId', deleteBlog);

//implement authorization route

module.exports = { blogsRouter };
