var Q = require('q');
var Account = require('./account.js');

function Transfer(netbank) {
	this.netbank = netbank;

	this.accountsFrom = {};
	this.accountsToLinked = {};
	this.accountsToNotLinked = {};

	this.transfer = {
		description: ''
	};
}

Transfer.prototype = {
	init: function () {
		var deferred = Q.defer();

		this.netbank.callNetbank('initTransfer', {}, function (data) {
			data.AccountsFrom.forEach(function(account){
				this.accountsFrom[account.AccountNumberHash] = {
					id: account.Id,
					name: account.AccountName,
					avalible: this.netbank.parseMoney(account.AvailableFunds)
				};
			}.bind(this));

			data.AccountsToLinked.forEach(function(account){
				this.accountsToLinked[account.AccountNumberHash] = {
					id: account.Id,
					name: account.AccountName,
					avalible: this.netbank.parseMoney(account.AvailableFunds)
				};
			}.bind(this));

			data.AccountsToNotLinked.forEach(function(account){
				this.accountsToNotLinked[account.AccountNumberHash] = {
					id: account.Id,
					name: account.AccountName,
					avalible: null
				};
			}.bind(this));

			deferred.resolve(data);
		}.bind(this));

		return deferred.promise;
	},

	setFromAccount: function (account) {
		if(account instanceof Account){
			var hash = account.getAccountNumberHash();

			if(hash in this.accountsFrom){
				this.transfer.AccountFromId = this.accountsFrom[hash].id;
			}else{
				throw new Error('Invalid from account. It wasn\'t in the list of available accounts');
			}
		}else if (typeof account == "string"){
			if(account in this.accountsFrom){
				this.transfer.AccountFromId = this.accountsFrom[hash].id;
			}else{
				throw new Error('Invalid from account. It wasn\'t in the list of available accounts');
			}
		}else{
			throw new Error('Invalid type of param, please pass me an Account object or an AccountNumberHash as a string.');
		}
	},

	setToAccount: function (account) {
		if(account instanceof Account){
			var hash = account.getAccountNumberHash();

			if(hash in this.accountsToLinked) {
				this.transfer.AccountToId = this.accountsToLinked[hash].id;
			}else if(hash in this.accountsToNotLinked){
				this.transfer.AccountToId = this.accountsToNotLinked[hash].id;
			}else{
				throw new Error('Invalid to account. It wasn\'t in the list of available accounts');
			}
		}else if (typeof account == "string"){
			if(account in this.accountsToLinked) {
				this.transfer.AccountToId = this.accountsToLinked[account].id;
			}else if(account in this.accountsToNotLinked){
				this.transfer.AccountToId = this.accountsToNotLinked[account].id;
			}else{
				throw new Error('Invalid to account. It wasn\'t in the list of available accounts');
			}
		}else{
			throw new Error('Invalid type of param, please pass me an Account object or an AccountNumberHash as a string.');
		}
	},

	setAmount: function (amount) {
		if(parseFloat(amount) < 0.01){
			throw new Error('Can\'t set a transfer number less than 0.01');
		}

		this.transfer.Amount = parseFloat(amount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	},

	setDescription: function (description) {
		if(typeof description !== "string"){
			throw new Error('Invalid type of param, please pass me a string.');
		}

		this.transfer.description = description;
	},

	validate: function(){
		var deferred = Q.defer();

		this.netbank.callNetbank('validateTransfer', this.transfer, function (data) {
			if(data.ErrorMessages.length !== 0){
				throw new Error(data.ErrorMessages);
			}

			deferred.resolve(data);
		});

		return deferred.promise;
	},

	process: function(){
		var deferred = Q.defer();

		this.netbank.callNetbank('processTransfer', this.transfer, function (data) {
			if(data.ErrorMessages.length !== 0){
				throw new Error(data.ErrorMessages);
			}

			deferred.resolve(data);
		});

		return deferred.promise;
	}
};

module.exports = Transfer;