'use strict';

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('../lib/strategy');


//Passport session setup

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new OAuth2Strategy({
    appid: 'wx3af1ba5b6113419d',
    state: true,
    appSecret: '74c7bf3702ff7d2cbc554ce19248a4b7',
    callbackURL: 'http://api.liangyali.com:3000/auth/wechat/callback'
}, function (openid, profile, token, done) {

    //处理用户信息，这里负责用户ID的转换，进行本地用户映射
    return done(null, openid, profile);
}));

var app = express();

app.use(session({secret: 'test'}));

app.get('/auth/err', function (req, res) {
    res.send({message: 'error'});
});

app.get('/auth/success', function (req, res) {
    res.send({message: 'success'});
});

app.get('/', function (req, res) {
    res.json({status: 'ok'});
});

app.get('/auth/wechat', passport.authenticate('wechat'), function (req, res) {
    //dont't call it
});

app.get('/auth/wechat/callback', passport.authenticate('wechat', {
        failureRedirect: '/auth/err',
        successRedirect: '/auth/success'}),
    function (req, res) {
        //nothig to do

        res.json(req.user);
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    if (res.isAuthencicated()) {
        return next();
    }

    res.redirect('login');
}

app.listen(3000, function () {
    console.log('started listen');
});