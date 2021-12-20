const sc = require('sourcecred').sourcecred;
const fs = require("fs-extra");
const Web3 = require('web3');
const isValidAddress = require('web3-utils').isAddress;
const _ = require('lodash');

const Ledger = sc.ledger.ledger.Ledger;
const G = sc.ledger.grain;

const NodeAddress = sc.core.address.makeAddressModule({
  name: "NodeAddress",
  nonce: "N",
  otherNonces: new Map().set("E", "EdgeAddress"),
});

const LEDGER_PATH = 'data/ledger.json';
const MINT_AMOUNTS_PATH = './scripts/toMint12Disburse.json';

(async function () {
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  
  const ledger = Ledger.parse(ledgerJSON);
  const accounts = ledger.accounts();
  
  const accountsWithAddress = accounts.map(a => {
    if (a.identity.subtype === 'BOT') return null;
    if (!a.active) return null
    
    const ethAliases = a.identity.aliases.filter(alias => {
      const parts = NodeAddress.toParts(alias.address);
      return parts.indexOf('ethereum') > 0;
    });
    
    if (!ethAliases.length) return null;
    
    let ethAddress = null;
    
    ethAliases.forEach(alias => {
      ethAddress = NodeAddress.toParts(alias.address)[2];
    });

    return {
      ...a,
      ethAddress: ethAddress,
    };
  }).filter(Boolean);
  
  const addressAccounts = _.keyBy(accountsWithAddress, 'ethAddress')
  const newMintAmounts = {};
  let total = 0;
  accountsWithAddress.forEach(acc => {
    const amountToMint = G.format(acc.balance, 9, '');
    newMintAmounts[acc.ethAddress] = amountToMint;
    if (!isValidAddress(acc.ethAddress)) {
      console.log('INVALID ADD for acc: ', acc);
    }

    total += parseFloat(amountToMint);
  });

  console.log(Object.entries(newMintAmounts).map(([address, amount]) => {
    const acc = addressAccounts[address];

    return `${acc && acc.identity.name},${address},${amount}`
  }).join('\n'));
  console.log({ total });
  
  fs.writeFile(MINT_AMOUNTS_PATH, JSON.stringify(newMintAmounts));
})();
