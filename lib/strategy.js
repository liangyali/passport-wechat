'use strict';
/*
 * passport-wechat
 * http://www.liangyali.com
 *
 * Copyright (c) 2014 liangyali
 * Licensed under the MIT license.
 */

var util = require('util');
var passport = require('passport-strategy');
var OAuth = require('wechat').OAuth;
var uid = require('uid2');
var debug = require('debug')('passport-wechat');

function WechatStrategy(options, verify) {
    if (typeof options === 'function') {
        verify = options;
        options = undefined;
    }

    options = options || {};

    if (!verify) {
        throw new TypeError('WeChatStrategy required a verify callback');
    }

    if (typeof verify !== 'function') {
        throw new TypeError('_verify must be function');
    }

    if (!options.appid) {
        throw new TypeError('WechatStrategy requires a appid option');
    }

    if (!options.appsecret) {
        throw new TypeError('WechatStrategy requires a appsecret option');
    }

    passport.Strategy.call(this, options, verify);

    this.name = 'wechat';
    this._verify = verify;
    this._oauth = new OAuth(options.appid, options.appsecret);
    this._callbackURL = options.callbackURL;
    this._key = options.sessionKey || '__wechat:session';
    this.lang = options.lang || 'zh-CN';
    this._state = options.state;
    this._scope = options.scope  || 'snsapi_userinfo';
    this._scopeSeparator = options.scopeSeparator || ' ';
    this._trustProxy = options.proxy;
    this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from 'passort.Strategy'
 */
util.inherits(WechatStrategy, passport.Strategy);

WechatStrategy.prototype.authenticate = function (req, options) {

    if (!req._passport) {
        return this.error(new Error('passport.initialize() middleware not in use'));
    }
    options = options || {};

    var self = this;

    // 获取code,用户禁止授权
    if (req.query && req.query.state && !req.query.code) {
        debug('Bad request -> \n[%s]', req.url);
        return this.error(new Error('Bad request'), 400);
    }

    // 获取code授权成功
    if (req.query && req.query.code) {
        var code = req.query.code;

        debug('Process wechat callback -> \n %s', req.url);

        /*// 如果打开状态，进行处理
        if (this._state) {
            if (!req.session) {
                return this.error(new Error('requires session support when use state,you can app.use(express.session(..))'));
            }

            var key = this._key;
            if (!req.session[key]) {
                return this.fail({message: 'Unable to verify authorization request,state'}, 403);
            }

            var state = req.session[key].state;
            if (!state) {
                return this.fail({message: 'Unable to verify authorization request state'}, 403);
            }

            delete req.session[key].state;

            if (Object.keys(req.session[key]).length === 0) {
                delete req.session[key];
            }

            if (state !== req.query.state) {
                return this.fail({message: 'Invalid authorization request state'}, 403);
            }
        }*/

        self._oauth.getAccessToken(code, function (err, response) {

            // 校验完成信息
            function verified(err, profile, info) {
                if (err) {
                    return self.error(err);
                }
                if (!profile) {
                    return self.fail(info);
                }
                return self.success(profile, info);
            }

            if (err) {
                return self.error(err);
            }

            var params = response.data;

            if (~params.scope.indexOf('snsapi_base')) {
                try {
                    if (self._passReqToCallback) {
                        self._verify(req, params.openid, {
                            'openid' : params.openid
                        }, params, verified);
                    } else {
                        self._verify(params.openid, {
                            'openid' : params.openid
                        }, params, verified);
                    }
                } catch (ex) {
                    return self.error(ex);
                }
            } else {
                self._oauth.getUser(params.openid, function (err, profile) {

                    if (err) {
                        debug('return wechat user profile ->', err.message);
                        return self.error(err);
                    }

                    debug('return wechat user profile -> \n %s', JSON.stringify(profile, null, ' '));

                    try {
                        if (self._passReqToCallback) {
                            self._verify(req, params.openid, profile, params, verified);
                        } else {
                            self._verify(params.openid, profile, params, verified);
                        }
                    } catch (ex) {
                        return self.error(ex);
                    }
                });
            }
        });
    } else {
        // 获取code,跳转到微信站点进行用户授权
        /*if (!options.state && this._state) {
            if (!req.session) {
                return this.error(new Error('requires session support when use state,you can app.use(express.session(..))'));
            }
            if (!req.session[this._key]) {
                req.session[this._key] = {};
            }

            options.state = uid(24);
            req.session[this._key].state = options.state;
        }*/

        var location = self._oauth.getAuthorizeURL(self._callbackURL, self._state, self._scope);
        debug('redirect authorizeURL -> \n%s', location);
        this.redirect(location, 302);
    }
};

module.exports = WechatStrategy;
