var nb = require('./lib/NetBank.js')

module.exports = function(clientNumber, password){
    return new nb(clientNumber, password);
};