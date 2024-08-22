// Import necessary modules and dependencies
const userSchema = require('../../db/db_config').User;
const mongoose = require('mongoose');
const { createUser, getUserByIdService, deleteUserService, loginUser } = require('./users.services');
const HttpError = require('../../middleware/http-error');
const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');

module.exports = {
    getUsers: async (req, res, next) => {        
        let users;
        try {
            users = await userSchema.find({}, '-password');
        }
        catch (err) {
            return next(new HttpError('Fetching users failed, please try again later', 500));
        }
        res.json({ users: users.map(user => user.toObject({ getters: true })) });
    },

    addUser: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new HttpError('Invalid inputs passed, please check your data.', 422));
        }

        const { name, email, password, bio } = req.body;

        let existingUser;
        try {
            existingUser = await userSchema.findOne({ email });
        } catch (err) {
            const error = new HttpError('Signing Up failed, please try again later.', 500)
            return next(error);
        }

        if (existingUser) {
            const error = new HttpError('User Exists already, please login instead.', 422)
            return next(error);
        }

        // const img= req.file.path;

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 15);
        } catch (err) {
            const error = new HttpError('Could not create user, please try again.', 500)
            return next(error);
        }

        createUser(name, email, hashedPassword, bio, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: err });
            }
            else {
                return res.status(201).json(result);
            }
        });
    },

    getUserById: (req, res) => {
        const userId = req.params.userId;

        getUserByIdService(userId, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json(result);
            }
        })
    },

    signInUser: async (req, res, next) => {
        const { email, password } = req.body;

        let existingUser;
        try {
            existingUser = await userSchema.findOne({ email });
        } catch (err) {
            const error = new HttpError('Could not sign in, please try again later.', 500);
            return next(error);
        }

        if (!existingUser) {
            const error = new HttpError('Invalid credentials, could not log you in. user not found', 401);
            return next(error);
        }

        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, existingUser.password);
        } catch (err) {
            const error = new HttpError('Could not log you in, please check your credentials and try again.', 500);
            return next(error);
        }

        if (!isValidPassword) {
            const error = new HttpError('Invalid credentials, could not log you in.', 401);
            return next(error);
        }

        loginUser(existingUser, (err, result) => {
            if (err) {
                return res.status(401).send({ error: err });
            }
            else {
                return res.status(201).send(result);
            }
        })
    },

    deleteUser: (req, res) => {
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        // const userId=req.params.userId;

        deleteUserService(userId, (err, result) => {
            if (err) {
                return res.status(400).send({ error: err });
            }
            else {
                return res.status(200).json({ message: 'Successfully Deleted' });
            }
        })
    }
}
