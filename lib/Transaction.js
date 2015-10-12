var nb = require('./NetBank.js');
var Q = require('q');

function Transaction(netbank, account, data) {
	this.netbank = netbank;
	this.account = account;
	this.data = data;
}

Transaction.prototype = {
	getAmount: function () {
		return this.netbank.parseMoney(this.data.Amount);
	},

	getBalance: function () {
		return this.netbank.parseMoney(this.data.Balance);
	},

	getDescription: function () {
		return this.data.Description.replace("<br/>", "\n").trim();
	},

	getDate: function () {
		return this.EffectiveDate;
	},

	isPending: function () {
		return !!this.IsPending;
	},

	getAccount: function () {
		return this.account;
	}
};

module.exports = Transaction;