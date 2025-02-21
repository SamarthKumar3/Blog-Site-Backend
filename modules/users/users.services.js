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

    getUserByIdService: async (userId, callback) => {
        try {
            const user = await userSchema.findById(userId, '-password').populate('blogs');
            if (!user) {
                return callback('User not found', null);
            }
            const categories = [...new Set(user.blogs.flatMap(blog => blog.categories))];
            const tags = [...new Set(user.blogs.flatMap(blog => blog.tags))];
            const joiningDate = user.createdAt.toISOString().split('T')[0];
            const profileData = {
                id: user._id,
                name: user.name,
                bio: user.bio || '',
                email: user.email,
                totalBlogs: user.blogs.length,
                categories,
                tags,
                blogTitles: user.blogs.map(blog => ({
                    id: blog._id,
                    title: blog.title
                })),
                joiningDate
            };
            return callback(null, profileData);
        } catch (error) {
            console.error('Error fetching user:', error);
            return callback('Internal server error', null);
        }
    },

    loginUser: async (existingUser, callback) => {
        let token;
        try {
            token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, `${process.env.SECRET_KEY}`, { expiresIn: '1h' });
        } catch (err) {
            console.error(err);
            callback({ message: "Logging In failed, please try again later." }, null);
            return;
        }
        callback(null, { userId: existingUser.id, email: existingUser.email, token });
    },

    deleteUserService: (userId, callback) => {
        console.log('Deleting user');
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

