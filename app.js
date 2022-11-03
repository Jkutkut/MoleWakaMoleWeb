// ********** Dependencies **********
const express = require('express');
// const https = require('https');
require('fetch');
const path = require('path');
require('dotenv').config();
// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const bodyParser = require('body-parser');

// **** Passport ****
// const passport = require('passport');
// const FortyTwoStrategy = require('passport-42').Strategy;
// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

// ********** Code **********

// **** 42 Strategy with passport ****
// Configure the 42 strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the 42 API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
// passport.use(new FortyTwoStrategy(
//     {
//         clientID: process.env['CLIENT_ID'],
//         clientSecret: process.env['SECRET'],
//         callbackURL: process.env['CALLBACK_URL']
//     },
//     function(accessToken, refreshToken, profile, cb) {
//         // In this example, the user's 42 profile is supplied as the user
//         // record.  In a production-quality application, the 42 profile should
//         // be associated with a user record in the application's database, which
//         // allows for account linking and authentication with other identity
//         // providers.
//         // console.log(profile); // TODO debug
//         return cb(null, profile);
//     }
// ));

// **** Passport session persistence ****
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete 42 profile is serialized
// and deserialized.
// passport.serializeUser(function(user, cb) {
//     cb(null, user);
// });

// passport.deserializeUser(function(obj, cb) {
//     cb(null, obj);
// });

// **** Express ****
const app = express();

// **** View engine setup ****
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
// app.use(logger('dev'));
// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }));
// // TODO secret?
// app.use(session({ resave: false, saveUninitialized: false, secret: '!terceS' }));
// app.use(express.static(path.join(__dirname, 'public')));

// **** Session ****
// Initialize Passport and restore authentication state, if any, from the
// session.
// app.use(passport.initialize());
// app.use(passport.session());


// ********** Routes **********
app.get(
    '/',
    // ensureLoggedIn(),
    (req, res) => {
        res.redirect('/app');
    }
);
// app.get(
//     '/login',
//     passport.authenticate('42')
// );

// // TODO if login fails, loop may occur
// app.get(
//     '/callback',
//     passport.authenticate('42',
//         {
//             failureRedirect: '/login',
//             // successRedirect: '/app'
//         }
//     ),
//     async (req, res) => {
//         // TODO
//         console.log("code: " + req.query.code);

//         let token = await fetch(
//             process.env.AUTH_URL,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     grant_type: 'authorization_code',
//                     client_id: process.env.CLIENT_ID,
//                     client_secret: process.env.SECRET,
//                     code: req.query.code,
//                     redirect_uri: process.env.CALLBACK_URL,
//                 })
//             }
//         ).then(res => res.json()).then((data) => {
//             console.log(data);
//             res.redirect('/app');
//         });
//         // TODO
//         // res.redirect('/app');
//     }
// );

app.get(
    '/app',
    // ensureLoggedIn(),
    (req, res) => {
        res.render('app', { user: req.user });
    }
)

app.get(
    '/terminal',
    (req, res) => {
        res.render('terminal', { user: req.user });
    }
)

var token = null;
async function getToken() {
    token = await fetch(
        process.env.AUTH_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.SECRET
            })
        }
    ).then(res => res.json()).then((data) => {
        console.log(data);
        return data;
    });
}; getToken();


// **** Errors ****
// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// ********** Module **********
module.exports = app;
