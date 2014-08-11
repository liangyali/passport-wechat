/*
 * passport-wechat
 * http://www.liangyali.com
 *
 * Copyright (c) 2014 liangyali
 * Licensed under the MIT license.
 */

var util = require('util');
var querystring = require('querystring');
var request = require('request');
var events = require('events');
var _ = require('underscore');

var authorizeURL = 'https://open.weixin.qq.com/connect/oauth2/authorize';
var accessTokenURL = 'https://api.weixin.qq.com/sns/oauth2/access_token';
var profileURL = 'https://api.weixin.qq.com/sns/userinfo';

/**
 * Create a new `OAuth` with the given `options`.
 *
 * @param {Object} options
 */
function OAuth(options) {

    options = options || {};

    if (!options.appid) {
        throw new Error('options.appid is required!');
    }

    if (!options.appSecret) {
        throw new Error('options.appSecret is required!');
    }

    if (!options.callbackURL) {
        throw new Error('options.callbackURL is required!');
    }

    this._appid = options.appid;
    this._appSecret = options.appSecret;
    this._authorizeURL = options.authorizeURL || authorizeURL;
    this._accessTokenURL = options.accessTokenURL || accessTokenURL;
    this._profileURL = options.profileURL || profileURL;
    this._callbackURL = options.callbackURL;
    this._scope = options.scope || 'snsapi_base';
    this._state = options.state || '';

    events.EventEmitter.call(this);
}

//inherits
util.inherits(OAuth, events.EventEmitter);

/**
 * 生成验证的authorizeURL
 *
 * @param {Object} options
 * @sample options sample
 * // options
 * {
 *      redirect:'api.liangyali.com',
 *      scope:'snsapi_base',
 *      state:''
 * }
 * @returns {String} wechar _oauth url
 * @api public
 */
OAuth.prototype.authorizeURL = function (options) {

    var params = _.extend({
        appid: this._appid,
        redirect_uri: this._callbackURL,
        response_type: 'code',
        scope: this._scope,
        state: this._state
    }, options);

    return util.format('%s?%s#wechat_redirect', this._authorizeURL, querystring.stringify(params));
};


/**
 * 认证通过Code换取AccessToken
 *
 * @param {String} code
 * @param {Function} callback
 * @returns {*}
 * @api public
 */
OAuth.prototype.authenticate = function (code, options, callback) {
    if (!code) {
        callback(new Error('code is required!'));
    }

    if (!callback || typeof callback !== 'function') {
        return callback(new Error('callback is required!'));
    }

    var params = _.extend({
        appid: this._appid,
        secret: this._appSecret,
        code: code,
        grant_type: 'authorization_code'
    }, options);

    request(this._accessTokenURL, {json: true, qs: params}, function (err, res, token) {

        if (token && token.errcode) {
            return callback(new Error(token.errmsg, token.errcode));
        }

        callback(err, token);
    });
};

/**
 * 获取用户个人信息
 *
 * @param {String} accessToken
 * @param {Function} callback
 * @returns {*}
 * @api public
 */
OAuth.prototype.getUserProfile = function (options, callback) {

    if (!options.openid) {
        return callback(new Error('options.openid is required!'));
    }

    if (!options.access_token) {
        return callback(new Error('options.access_token is required!'));
    }

    if (!callback || typeof callback !== 'function') {
        return callback(new Error('callback is required!'));
    }

    var params = {
        access_token: options.access_token,
        openid: options.openid,
        lang: options.lang || 'zh-CN'
    };

    request(this._profileURL, {json: true, qs: params}, function (err, res, profile) {

        //校验返回数据
        if (profile && profile.errcode) {
            return callback(new Error(profile.errmsg, profile.errcode));
        }

        callback(err, profile);
    });
};

module.exports = OAuth;