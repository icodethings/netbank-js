var Transaction = require('./Transaction.js');
var Q = require('q');

function Account(netbank, data) {
	this.netbank = netbank;
	this.data = data;
}

Account.prototype = {
	getBalance: function () {
		return this.netbank.parseMoney(this.data.Balance);
	},

	getBalance: function () {
		return this.netbank.parseMoney(this.data.AvailableFunds);
	},

	getName: function () {
		return this.data.AccountName;
	},

	getAccountId: function () {
		return this.data.Id;
	},

	getAccountNumberHash: function () {
		return this.data.AccountNumberHash;
	},

	getTransactions: function () {
		var deferred = Q.defer();

		this.netbank.callNetbank('getTransactions', {
			AccountID: this.getAccountId(),
			AccountIdIsUser: true
		}, function (data) {
			var transactions = [];

			// Some accounts (like super) don't return transactions
			if (!data.Transactions) {
				return deferred.resolve([]);
			}

			data.Transactions.forEach(function (transaction) {
				transactions.push(new Transaction(this.netbank, this, transaction));
			}.bind(this));

			deferred.resolve(transactions);
		}.bind(this));

		return deferred.promise;
	}
};

module.exports = Account;