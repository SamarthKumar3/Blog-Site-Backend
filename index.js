const express = require('express');
const mongoose = require('mongoose');
const { globalRouter } = require('./routes/global.router');
const cors = require('cors');

const app = express();
app.use(express.json());
const port = 5000;

app.use(cors());

app.use('/', globalRouter);



mongoose.connect('mongodb+srv://Samarth:3x-2hhiF_yQSrzM@blog.lloogxh.mongodb.net/?retryWrites=true&w=majority').then(() => {
    app.listen(port, () => {
        console.log("Connected");
    });
}).catch(err => {
    console.log(err);
});

