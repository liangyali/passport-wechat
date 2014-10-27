# passport-wechat [![Build Status](https://secure.travis-ci.org/liangyali/passport-wechat.png?branch=master)](http://travis-ci.org/liangyali/passport-wechat)

> passport wechat


## Getting Started

Install the module with: `npm install passport-wechat`

```js
var WechatStrategy = require('passport-wechat');
```

Install with cli command

```sh
$ npm install -g passport-wechat --save
```




## Documentation

_(Coming soon)_


## Examples

```
'use strict';

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('../lib/strategy');


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// 相关配置为测试账号信息
passport.use(new WechatStrategy({
    appid: 'wx3af1ba5b6113419d',
    state: true,
    appsecret: '74c7bf3702ff7d2cbc554ce19248a4b7',
    callbackURL: 'http://api.liangyali.com:3000/auth/wechat/callback'
}, function (openid, profile, token, done) {
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


```


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 liangyali  
Licensed under the MIT license.
