const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const router = require('express').Router();
const dotenv = require('dotenv');

// build app
const app = express();

// get enviorment variables
dotenv.config();

// create connection with db
// const connectionRequest =  require('../config/database_config');
// connectDB = connectionRequest();

// Logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


// get enviorment variables
dotenv.config();

// Import register route
const seller = require('./Routes/seller');
const buyer = require('./Routes/buyer');
const product = require('./Routes/products');
const order = require('./Routes/orders');


// Middleware (body parser for json)
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// Route Middlewares
app.use('/seller', seller);
app.use('/buyer', buyer);
app.use('/product', product);
app.use('/order', order);


var server_port = process.env.MY_PORT || process.env.PORT || 3279;
var server_port = process.env.PORT;
var server_host = process.env.MY_HOST || process.env.HOST  || '0.0.0.0';

// For running sever localy

// app.listen(3000 ,()=>{
//     console.log(`Sever is running on port ${3000}`);
// });


// For Running server online.

app.listen(server_port, server_host ,()=>{
    console.log(`Sever is running in ${process.env.NODE_ENV} mode on port : ${server_port}`);
});

/* 
    change server port code in index js,
    chnage code in news js
*/