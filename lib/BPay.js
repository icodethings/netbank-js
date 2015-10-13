var Q = require('q');
var Account = require('./account.js');

function BPay(netbank) {
	this.netbank = netbank;

	this.accountsFrom = {};
	this.billers = {};

	this.transfer = {
		description: 'BPay'
	};
}

BPay.prototype = {
	init: function () {
		var deferred = Q.defer();

		this.netbank.callNetbank('initBPay', {}, function (data) {
			data.Accounts.forEach(function (account) {
				this.accountsFrom[account.AccountNumberHash] = {
					id: account.Id,
					name: account.AccountName,
					avalible: this.netbank.parseMoney(account.AvailableFunds)
				};
			}.bind(this));

			data.Billers.forEach(function (biller) {
				this.billers[biller.Crn] = {
					billerId: biller.BillerId,
					name: biller.BillerName + ' ' + biller.BillerNickName,
					crn: biller.Crn,

				};
			}.bind(this));

			deferred.resolve(data);
		}.bind(this));

		return deferred.promise;
	},

	setFromAccount: function (account) {
		if (account instanceof Account) {
			var hash = account.getAccountNumberHash();

			if (hash in this.accountsFrom) {
				this.transfer.AccountFromId = this.accountsFrom[hash].id;
			} else {
				throw new Error('Invalid from account. It wasn\'t in the list of available accounts');
			}
		} else if (typeof account == "string") {
			if (account in this.accountsFrom) {
				this.transfer.AccountFromId = this.accountsFrom[account].id;
			} else {
				throw new Error('Invalid from account. It wasn\'t in the list of available accounts');
			}
		} else {
			throw new Error('Invalid type of param, please pass me an Account object or an AccountNumberHash as a string.');
		}
	},

	getBillers: function(){
		return this.billers;
	},

	setBiller: function (crn) {
		if (typeof crn == "string") {
			if(crn in this.billers){
				this.transfer.BillerId = this.billers[crn].billerId;
				this.transfer.Crn = this.billers[crn].crn;
			}else{
				throw new Error('Invalid biller. It wasn\'t in the list of available billers');
			}
		} else {
			throw new Error('Invalid type of param, please pass me an a string with a CRN.');
		}
	},

	setAmount: function (amount) {
		if (parseFloat(amount) < 0.01) {
			throw new Error('Can\'t set a transfer number less than 0.01');
		}

		this.transfer.Amount = parseFloat(amount).toFixed(2);
	},

	setDescription: function (description) {
		if (typeof description !== "string") {
			throw new Error('Invalid type of param, please pass me a string.');
		}

		this.transfer.description = description;
	},

	validate: function () {
		var deferred = Q.defer();

		this.netbank.callNetbank('validateBPay', this.transfer, function (data) {
			if (data.ErrorMessages.length !== 0) {
				throw new Error(data.ErrorMessages);
			}

			deferred.resolve(data);
		});

		return deferred.promise;
	},

	process: function () {
		var deferred = Q.defer();

		this.netbank.callNetbank('processBPay', this.transfer, function (data) {
			if (data.ErrorMessages.length !== 0) {
				throw new Error(data.ErrorMessages);
			}

			deferred.resolve(data);
		});

		return deferred.promise;
	}
};

module.exports = BPay;