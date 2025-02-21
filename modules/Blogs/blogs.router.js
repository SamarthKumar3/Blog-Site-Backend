const Router = require('express');
const { getBlogs, addBlog, getBlogById, deleteBlog, addLikes, addComments, deleteComment, getTrendingBlog, getTopBlog } = require('./blogs.controller');
const fileUpload = require('../../middleware/fileUpload');
const checkAuth = require('../../middleware/checkAuth');

const { check } = require('express-validator');

const blogsRouter = Router();

blogsRouter.get('/all-blogs', getBlogs);

blogsRouter.get('/all-blogs/:blogId', getBlogById);

blogsRouter.get('/trending/new', getTrendingBlog);

blogsRouter.get('/top-blogs', getTopBlog)

blogsRouter.use(checkAuth);

blogsRouter.post('/create/new', fileUpload.single('image'),
    [check('title').not().isEmpty(),
    check('content').isLength({ min: 20 }),
    check('tags').not().isEmpty(),
    check('categories').not().isEmpty()
    ]
    , addBlog);

blogsRouter.patch('/likes/:blogId', addLikes);

blogsRouter.post('/comments/:blogId', [
    check('name').not().isEmpty(),
    check('comment').isLength({ min: 5 })]
    , addComments);

blogsRouter.delete('/comment/:commentId/delete/:blogId', deleteComment);

blogsRouter.delete('/delete/:blogId', deleteBlog);

module.exports = { blogsRouter };
