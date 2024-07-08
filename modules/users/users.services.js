const userSchema = require('../../db/db_config');

module.exports = {
    createUser: (name, email, password, img, callback) => {
        let newUser = new userSchema({
            name,
            email,
            password,
            bio,
            profilePic: img,
            blogs: []
        });
        newUser.save().then((user) => {
            callback(null, user);
        })
            .catch((err) => {
                callback({ err }, null);
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

    loginUser: async (email, password, callback) => {
        try {
            const user = await userSchema.findOne({ email });
            if (!user) {
                return callback({ err: 'Invalid email id' }, null);
            }
            if (user.password !== password) {
                return callback({ err: 'Invalid password' }, null);
            }

            callback(null, { message: 'Successfully signed in' });
        }
        catch (err) {
            callback({ err: "Could not find user" }, null);
        }

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

