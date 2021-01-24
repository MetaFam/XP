const sc = require('sourcecred-publish-test');
const fs = require("fs-extra")
const _ = require('lodash');
const fetch = require('node-fetch');

const Ledger = sc.ledger.ledger.Ledger;

const addressUtils = sc.plugins.ethereum.utils.address

const NodeAddress = sc.core.address.makeAddressModule({
  name: "NodeAddress",
  nonce: "N",
  otherNonces: new Map().set("E", "EdgeAddress"),
});

const LEDGER_PATH = 'data/ledger.json';
const address_book_file = "https://raw.githubusercontent.com/MetaFam/TheSource/master/addressbook.json";


(async function() {
  
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  const accountsJSON = JSON.parse((await fs.readFile('output/accounts.json')).toString());
  
  const AddressBook = (await (await fetch(address_book_file)).json());
  const AddressMap = _.keyBy(AddressBook, 'discordId');
  
  const activeAccounts = accountsJSON.accounts.filter(acc => acc.totalCred > 5);
  const activeUserMap = _.keyBy(activeAccounts, 'account.identity.id');
  
  const ledger = Ledger.parse(ledgerJSON);
  const accounts = ledger.accounts();
  
  const discordAcc = accounts.map(a => {
    const credAcc = activeUserMap[a.identity.id];
    if (!credAcc) return null;
    if (a.identity.subtype !== 'USER') return null;
    
    const discordAliases = a.identity.aliases.filter(alias => {
      const parts = NodeAddress.toParts(alias.address);
      return parts.indexOf('discord') > 0;
    })
    
    if (!discordAliases.length) return null;
    
    let user = null;
    let discordId = null;
    
    discordAliases.forEach(alias => {
      discordId = NodeAddress.toParts(alias.address)[4];
      if (AddressMap[discordId]) {
        user = AddressMap[discordId]
      }
    })
    
    return {
      ...a,
      discordId,
      cred: credAcc.totalCred,
      ethAddress: user && user.address,
    }
  }).filter(Boolean);
  
  const discordAccWithAddress = discordAcc.filter(a => a.ethAddress)
  
  discordAccWithAddress.forEach(acc => {
    const ethAddress = addressUtils.parseAddress(acc.ethAddress);
    const identityProposal = sc.plugins.ethereum.utils.identity.createIdentity(ethAddress);
    
    const linkedAccount = ledger.accountByAddress(identityProposal.alias.address);
    
    if (linkedAccount) {
      return;
    }
    
    const identityId = sc.ledger.utils.ensureIdentityExists(ledger, identityProposal)
    ledger.mergeIdentities({ base: acc.identity.id, target: identityId })
  })
  
  await fs.writeFile(LEDGER_PATH, ledger.serialize())
  
})()
