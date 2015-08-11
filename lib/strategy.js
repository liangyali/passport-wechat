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
var OAuth = require('wechat-oauth');
var debug = require('debug')('passport-wechat');
var url = require('url');

function appendParams(href, params) {
    var urlObj = url.parse(href, true);

    Object.keys(params).forEach(function(key) {
        urlObj.query[key] = params[key];
    });

    urlObj.search = null;

    return url.format(urlObj);
}


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

    this.name = options.name || 'wechat';
    this._client = options.client || 'wechat';
    this._verify = verify;
    this._oauth = new OAuth(options.appid, options.appsecret, options.getToken, options.saveToken);
    this._callbackURL = options.callbackURL;
    this.lang = options.lang || 'zh-CN';
    this._state = options.state;
    this._scope = options.scope || 'snsapi_userinfo';
    this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from 'passort.Strategy'
 */
util.inherits(WechatStrategy, passport.Strategy);

WechatStrategy.prototype.authenticate = function (req) {

    if (!req._passport) {
        return this.error(new Error('passport.initialize() middleware not in use'));
    }

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
                    var profile = {
                        openid: params.openid,
                        unionid: params.unionid
                    };
                    if (self._passReqToCallback) {
                        self._verify(req, params.access_token, params.refresh_token, profile, verified);
                    } else {
                        self._verify(params.access_token, params.refresh_token, profile, verified);
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
                            self._verify(req, params.access_token, params.refresh_token, profile, verified);
                        } else {
                            self._verify(params.access_token, params.refresh_token, profile, verified);
                        }
                    } catch (ex) {
                        return self.error(ex);
                    }
                });
            }
        });
    } else {
        var callbackURL = appendParams(self._callbackURL, req.query);
        var client = (this._client === 'wechat') ? 'getAuthorizeURL' : 'getAuthorizeURLForWebsite';
        var location = self._oauth[client](callbackURL, self._state, self._scope);
        debug('callbackURL -> \n%s', callbackURL);
        debug('redirect authorizeURL -> \n%s', location);
        self.redirect(location, 302);
    }
};

module.exports = WechatStrategy;
