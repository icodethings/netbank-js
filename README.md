# netbank-js
JS library for talking to Commonwelth Bank's Mobile API using promises.

## Important Note

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Using this script requires you to input plaintext banking details. If you do not know how to properly and safely store these details please do not use this script. Please don't use this script on anything other than servers you fully control not ones that are shared. Again, I don't take any responsibility or have any implied warranty with this script. Please use it safely.

## Things it can do:

 - [X] Log in
 - [X] Get your accounts
 - [X] Get account transactions
 - [X] Do an inner account transfer
 - [X] Do a saved external account transfer
 - [ ] BPay

## Quick Example

```
var netbank = require('./netbank.js')('12345678', 'password123');

netbank.login()
.then(netbank.getAccounts)
.then(function(accounts){
	accounts.forEach(function(account){
		console.log(account.getName() + ' = ' + account.getAvailable();
	});
});
```

## Install

```
npm install --save netbank-js
```