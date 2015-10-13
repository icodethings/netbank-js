var request = require('request');
var querystring = require('querystring');
var Q = require('q');

var Account = require('./account.js');
var Transfer = require('./transfer.js');
var BPay = require('./bpay.js');

function NetBank(clientNumber, password) {
	this.sid = null;
	this.initialData = null;
	this.cookieJar = request.jar();

	this.creds = [clientNumber, password];
}

NetBank.prototype = {
	callNetbank: function (command, data, callback) {
		var params = [];

		data.Request = command;

		Object.keys(data).forEach(function (key) {
			params.push({Name: key, Value: data[key]});
		});

		var requestData = {Params: params};

		var postData = JSON.stringify(requestData);

		request.post({
			url: 'https://www1.my.commbank.com.au/mobile/i/AjaxCalls.aspx?SID=' + this.sid,
			body: postData,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.9) Gecko/20071025 Firefox/2.0.0.9'
			},
			jar: this.cookieJar
		}, function (err, httpResponse, body) {
			if (err) {
				console.log('Error', err);
				return callback(false);
			}

			var parsedBody = JSON.parse(body.substr(2, body.length - 4));

			this.sid = parsedBody.SID;

			return callback(parsedBody);
		}.bind(this));
	},

	login: function () {
		var deferred = Q.defer();

		this.callNetbank('login', {UserName: this.creds[0], Password: this.creds[1], Token: ''}, function (json) {
			this.initialData = json;

			delete(this.creds);

			deferred.resolve(true);
		}.bind(this));

		return deferred.promise;
	},

	parseMoney: function (str) {
		var prefix = '+';

		var ret = str.substr(1).replace(',', '').trim()

		var position = str.substr(-3).trim();

		if (position == 'DR') {
			prefix = '-';
		}

		return parseFloat("" + prefix + ret);
	},

	getAccounts: function () {
		var deferred = Q.defer();

		this.callNetbank('getAccounts', {}, function (data) {
			var accounts = [];

			data.AccountGroups.forEach(function (accountGroup) {
				accountGroup.ListAccount.forEach(function (account) {
					accounts.push(new Account(this, account))
				}.bind(this));
			}.bind(this));

			deferred.resolve(accounts);
		}.bind(this));

		return deferred.promise;
	},

	newTransfer: function () {
		return new Transfer(this);
	},

	newBPay: function(){
		return new BPay(this);
	}
};

module.exports = NetBank;