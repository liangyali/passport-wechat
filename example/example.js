'use strict';

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var WechatStrategy = require('../lib/strategy');


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// 相关配置为测试账号信息
passport.use(new WechatStrategy({
    appid: 'wx0ff7006738630a6c',
    appsecret: '866796103d71f653d69809cf1e8c2dae',
    callbackURL: 'http://192.168.1.70:3000/auth/wechat/callback',
    scope: 'snsapi_base',
    state: true
    // appid: 'wx3af1ba5b6113419d',
    // appsecret: '74c7bf3702ff7d2cbc554ce19248a4b7',
    // callbackURL: 'http://api.liangyali.com:3000/auth/wechat/callback'
}, function (openid, profile, token, done) {
    return done(null, openid, profile);
}));

var app = express();
app.use(session({secret: 'test'}));
app.use(passport.initialize());
app.use(passport.session());

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