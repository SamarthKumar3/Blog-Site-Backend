const express = require('express');
const mongoose = require('mongoose');
const { globalRouter } = require('./routes/global.router');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
const port = 5000;
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

app.use(cors());
app.use('/', globalRouter);

app.use((req, res, next) => {
    // const error = new HttpError('Could not find this route.', 400);
    // throw error;
    return res.status(400).send({ error: 'Could not find this route.' });
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }

    if (res.headersSent) {
        next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occured!' });
});

mongoose.connect('mongodb+srv://Samarth:3x-2hhiF_yQSrzM@blog.lloogxh.mongodb.net/?retryWrites=true&w=majority').then(() => {
    app.listen(port, () => {
        console.log("Connected");
    });
}).catch(err => {
    console.log(err);
});

