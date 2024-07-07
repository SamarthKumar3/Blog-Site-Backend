const Router = require('express');
const { getUsers, getUserById, addUser, deleteUser, signInUser } = require('./users.controller');
const usersRouter = Router();

// GET /users
usersRouter.get('/', getUsers);

// GET /users/:id
usersRouter.get('/:id', getUserById);

// POST /users
usersRouter.post('/signup', addUser);

// Sign in User
usersRouter.post('/signin', signInUser);

// DELETE /users/:id
usersRouter.delete('/:id', deleteUser);

module.exports = {usersRouter};