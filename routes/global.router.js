const Router = require('express');
const { blogsRouter } = require('../modules/Blogs/blogs.router');

const globalRouter = Router();

globalRouter.use('/api/blog', blogsRouter)

module.exports = { globalRouter };