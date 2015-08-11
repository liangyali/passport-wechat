# passport-wx [![Build Status](https://secure.travis-ci.org/liangyali/passport-wx.png?branch=master)](http://travis-ci.org/liangyali/passport-wx)

> passport wechat


## Getting Started

Install the module with: `npm install passport-wx`

```js
var WechatStrategy = require('passport-wx');
```

Install with cli command

```sh
$ npm install -g passport-wx --save
```




## Documentation

_(Coming soon)_

### Appended Features
* Support passing params to auth & callback, so requesting '/auth/wechat?next=/users/me' will then redirect to '/auth/wechat/callback?next=/users/me' and you can do `next`(such as redirect to `/users/me`) after authorized.
* Both support auth in wechat webview (default) and web page qr connect (set client to 'web').
* Support multiple wechat auths by specifying different strategy names.
* Change to [passport OAuth2](http://passportjs.org/docs/oauth#oauth-2-0) standard verify callback.

## Examples

```
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
    state: true,
    client: 'web', // optional, 'web' - for web qr connect, 'wechat' - for wechat app(default)
    name: 'wechat' // optional, default 'wechat', given more than one wechat strategies used
    // appid: 'wx3af1ba5b6113419d',
    // appsecret: '74c7bf3702ff7d2cbc554ce19248a4b7',
    // callbackURL: 'http://api.liangyali.com:3000/auth/wechat/callback'
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile.openid, profile);
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
        successRedirect: '/auth/success'}));

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    if (res.isAuthencicated()) {
        return next();
    }

    res.redirect('/login');
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
