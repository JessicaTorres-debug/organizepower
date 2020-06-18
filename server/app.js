/* eslint-disable max-len */
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
// const localStrat = require('./auth/passport');
const { validPassword } = require('./auth/passwordUtils');
const { sequelize } = require('./db/index');
const { User } = require('./db/index');
const { routes } = require('./routes');

// const { apiRouter } = require('./api');
// const { router } = require('./routes/login');
require('dotenv').config();

const app = express();

const CLIENT_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_PATH));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// passport.use('login', localStrat);
// app.use('/', router);

const sessionStore = new SequelizeStore({
  db: sequelize,
});

sessionStore.sync();

// allow express to use sessions, not sure if the secret is necessary or helpful
// express middleware used to retrieve user sessions from a datastore can find the session object because the session Id is stored in the cookie, which is provided to the server on every request
// NOTE: cookie-parser middleware is no longer needed
app.use(session({
  secret: process.env.SECRET || 'secretcat',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    // secure: true // requires HTTPS connection
    // maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  },
}));

// passport middleware must be used after express-session
app.use(passport.initialize());

// middleware to alter the req object and change the user value that is currently the session id (from the client cookie) into the true deserialized user object

app.use(passport.session());

passport.use(new LocalStrategy(
  // Here is the function that is supplied with the username and password field from the login POST request
  (username, password, cb) => {
    console.log(username);
    // Search the MongoDB database for the user with the supplied username
    User.findOne({ where: { username } })
      .then((user) => {
        console.log(user);
        /**
         * The callback function expects two values:
         *
         * 1. Err
         * 2. User
         *
         * If we don't find a user in the database, that doesn't mean there is an application error,
         * so we use `null` for the error value, and `false` for the user value
         */
        if (!user) {
          return cb(null, false, { message: 'line 77' });
        }

        /**
         * Since the function hasn't returned, we know that we have a valid `user` object.  We then
         * validate the `user` object `hash` and `salt` fields with the supplied password using our
         * utility function.  If they match, the `isValid` variable equals True.
         */
        const isValid = validPassword(password, user.hash, user.salt);

        if (isValid) {
          // Since we have a valid user, we want to return no err and the user object
          return cb(null, user);
        }
        // Since we have an invalid user, we want to return no err and no user
        return cb(null, false);
      })
      .catch((err) => {
        // This is an application error, so we need to populate the callback `err` field with it
        cb(err);
      });
  },
));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ where: { id } })
    .then((user) => {
      if (!user) { return cb('error'); }
      cb(null, user);
    });
});

app.use('/', routes);

// basic "strategy" for user authentication
// passport.use(new LocalStrategy((username, password, done) => {
//   User.findOne({ username }, (err, user) => {
//     if (err) { return done(err); }
//     if (!user) {
//       return done(null, false, { message: 'Incorrect username.' });
//     }
//     if (!user.validPassword(password)) {
//       return done(null, false, { message: 'Incorrect password.' });
//     }
//     return done(null, user);
//   })
//     .catch(err => console.error(err));
// }));

// these two methods will keep user session alive


// app.post('/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   }));

// app.use('/', apiRouter);

module.exports = {
  app,
};
