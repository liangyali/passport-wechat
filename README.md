# passport-wechat v2.0

[![Dependencies](https://david-dm.org/liangyali/passport-wechat.svg)](https://david-dm.org/liangyali/passport-wechat)

[Passport](http://passportjs.org/) strategy for authenticating with [Wechat](http://weixin.qq.com/)

##支持功能

* 微信公众账号
* 微信网站登陆

## 安装

    $ npm install passport-wechat
    
## 使用
#### Configure  Strategy

```js

 passport.use(new WechatStrategy({
        appID: {APPID},
        appSecret: {APPSECRET},
        client:{wechat|web},
        callbackURL: {CALLBACKURL},
        scope: {snsapi_userinfo|snsapi_base},
        state:{STATE}
      },
      function(accessToken, refreshToken, profile, done) {
        return done(err,profile);
      }
));

```

#### Authenticate Requests

```js
  router.get('/auth/wechat', passport.authenticate('wechat', options));
```
`options` - Optional. Can include the following:
* `state` - Override state for this specific API call

#### Authentication Callback

```js
  router.get('/auth/wechat/callback', passport.authenticate('wechat', {
    failureRedirect: '/auth/fail',
    successReturnToOrRedirect: '/'
  }));
```

## License

Copyright (c) 2014 liangyali  
Licensed under the MIT license.
