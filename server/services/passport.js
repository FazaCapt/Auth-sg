const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// create local strategy
const localOption = {usernameField: 'email'};
const localLogin = new LocalStrategy(localOption, function(email, password, done) {
    // Verivy this email and password, calldone with the user
    // if it is the correct email and password
    // otherwise, call done with false
    User.findOne({ email: email }, function(err, user) {
        if(err) { return done(err); }
        if(!user){ return done(null, false);}

        // compare passwords -is 'password' equal to user.password ?
        user.comparePassword(password, function(err, isMatch) {
            if(err) { return done(err); }
            if(!isMatch) { return done(null, false); }
        });
    });
});


// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    // See if the user ID in the payload exist in our database
    // if it does, call 'done' with that other
    // otherwese, call done without a user object
    User.findById(payload.sub, function(err, user) {
        if(err) { return done(err, false); }

        if(user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

// Tell Passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);