const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/login', passport.authenticate('42'));
router.get(
    '/login-callback',
    passport.authenticate(
        '42',
        {
            failureRedirect: '/login'
        }
    ),
    (req, res) => {
        console.log('req: ', req);
        console.log('res: ', res);
        // Successful authentication, redirect home.
        res.redirect('/working');
    }
);


// ***** Module *****
module.exports = router;