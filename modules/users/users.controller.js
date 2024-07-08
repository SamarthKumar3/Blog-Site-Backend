// Import necessary modules and dependencies
const userSchema = require('../../db/db_config').userSchema;
const mongoose = require('mongoose');
const { createUser, getUserByIdService, deleteUserService, loginUser } = require('./users.services');

module.exports = {
    getUsers: (req, res) => {
        userSchema.find({}).then((users) => {
            res.json(users);
        })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Error fetching users' });
            });
    },

    addUser: async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json("Missing data fields! Could not create user");
        }

        let existingUser;
        try {
            existingUser = await userSchema.findOne({ email: email });
        } catch (err) {
            const error = new HttpError('Signing Up failed, please try again later.', 500)
            return next(error);
        }

        if (existingUser) {
            const error = new HttpError('User Exists already, please login instead.', 422)
            return next(error);
        }

        const img= req.file.path;

        createUser(name, email, password,img, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: err });
            }
            else {
                return res.status(201).send(result);
            }
        })
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

    signInUser: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json("Missing data fields! Could not sign in user");
        }

        loginUser(email, password, (err, result) => {
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
