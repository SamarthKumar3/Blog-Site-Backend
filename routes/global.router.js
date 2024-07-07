const Router = require('express');
const { blogsRouter } = require('../modules/Blogs/blogs.router');
const { usersRouter } = require('../modules/users/users.router');

const globalRouter = Router();

globalRouter.use('/api/blog', blogsRouter)

globalRouter.use('/api/user', usersRouter)

module.exports = { globalRouter };