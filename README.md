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
        name:{默认为wechat,可以设置组件的名字}
        appSecret: {APPSECRET},
        client:{wechat|web},
        callbackURL: {CALLBACKURL},
        scope: {snsapi_userinfo|snsapi_base},
        state:{STATE},
        getToken: {getToken},
        saveToken: {saveToken}
      },
      function(accessToken, refreshToken, profile,expires_in, done) {
        return done(err,profile);
      }
));

The `callbackURL`, `scope` and `state` can be overwritten in `passport.authenticate` middleware.

The `getToken` and `saveToken` can be provided to initialize Wechat OAuth instance.

```

#### Authenticate Requests

```js
  router.get('/auth/wechat', passport.authenticate('wechat', options));
```
`options` - Optional. Can include the following:
* `state` - Override state for this specific API call
* `callbackURL` - Override callbackURL for this specific API call
* `scope` - Override scope for this specific API call

If no callbackURL is specified, the same request url will be used.

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
