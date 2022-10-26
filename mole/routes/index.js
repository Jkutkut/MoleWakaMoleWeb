const express = require('express');
// var db = require('../db');

var router = express.Router();

/* GET home page. */
router.get('/',
    (req, res, next) => {
        if (!req.user) { 
            console.log('req.user is not defined');
            return res.render('home');
        }
        next();
    },
    // fetchTodos,
    () => {},
    (req, res, next) => {
        res.locals.filter = null;
        res.render('index', { user: req.user });
    }
);

// ***** Module *****
module.exports = router;