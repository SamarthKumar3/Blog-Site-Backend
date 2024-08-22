const userSchema = require('../../db/db_config').User;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    createUser: async (name, email, hashedPassword, bio, callback) => {
        let newUser = new userSchema({
            name,
            email,
            password: hashedPassword,
            bio,
            // profilePic: img,
            blogs: []
        });
        await newUser.save()
            .then((user) => {
                let token;
                token = jwt.sign({ userId: user.id, email: user.email }, `${process.env.SECRET_KEY}`, { expiresIn: '1h' });
                callback(null, { userId: user.id, email: user.email, token });
            })
            .catch((err) => {
                console.error(err);
                callback({ message: "Could not create user" }, null);
            });
    },

    getUserByIdService: (userId, callback) => {
        userSchema.findById(userId)
            .then((user) => {
                callback(null, user);
            })
            .catch((err) => {
                callback({ err: "Could not find user" }, null);
            });
    },

    loginUser: async (existingUser, callback) => {
        let token;
        try {
            token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, `${process.env.SECRET_KEY}`, { expiresIn: '1h' });
        } catch (err) {
            console.error(err);
            callback({ message: "Logging In failed, please try again later." }, null);
        }
        callback(null, { userId: existingUser.id, email: existingUser.email, token });
    },

    deleteUserService: (userId, callback) => {
        console.log('Deleting user with ID:', userId);
        userSchema.deleteOne({ _id: userId })
            .then((deleted) => {
                callback(null, deleted);
            })
            .catch((err) => {
                console.error(err);
                callback({ err: "Could not find user" }, null);
            });
    }
}

