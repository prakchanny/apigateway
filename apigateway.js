const express = require('express');
const app = express();

//USE PROXY SERVER 
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRETE =  process.env.JWT_SECRETE;

function authToken(req, res, next) {
    console.log(req.headers.authorization);
    const header = req?.headers.authorization;
    const token = header && header.split(' ')[1]; // Extract token from Bearer scheme
    
    if (token == null) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) {
            return res.status(403).json("Invalid token", err);
        }
        req.user = user; 
        next()
    });
}



function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json("Unauthorized");
        } 
        next(); // User has the correct role
        
    }
}   

app.use('/teacher', authToken, authRole('teacher'), (req, res) => {
    console.log('INSIDE API GATEWAY TEACHER ROUTE ');
    proxy.web(req, res, { target: 'http://localhost:3000' });
})

app.use('/auth', (req, res) => {
    console.log('INSIDE API GATEWAY Login ROUTE ');
    proxy.web(req, res, { target: 'http://localhost:6000' });

})

 app.listen(5000, () => {
    console.log('API Gateway is running on port 5000');
    });

// //REDIRECT TO STUDENT MICROSERVICE
// app.use('/student', (req, res) => {
//     console.log('Inside API GATEWAY STUDENT ROUTE');
//     proxy.web(req, res, { target: 'http://3.95.221.5:4000' });
// });

// //REDIRECT TO TEACHER MICROSERVICE
// app.use('/teacher', (req, res) => {
//     console.log('Inside API GATEWAY TEACHER ROUTE');
//     proxy.web(req, res, { target: 'http://44.210.128.217:3000' });
// });

// app.listen(5000, () => {
//     console.log('API Gateway is running on port 5000');
//     });
