const sc = require('sourcecred').sourcecred;
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
  
  const AddressBook = (await (await fetch(address_book_file)).json());
  const AddressMap = _.keyBy(AddressBook, 'discordId');
  
  const ledger = Ledger.parse(ledgerJSON);
  const accounts = ledger.accounts();
  
  const discordAcc = accounts.map(a => {
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
      
      if(AddressMap[discordId]) {
        user = AddressMap[discordId]
      }
    })
    
    return {
      ...a,
      discordId,
      ethAddress: user?.address,
    }
  }).filter(Boolean);
  
  const discordAccWithAddress = discordAcc.filter(a => a.ethAddress)
  
  discordAccWithAddress.forEach(acc => {
    const ethAddress = addressUtils.parseAddress(acc.ethAddress);
    const baseIdentityId = acc.identity.id;
    const ethAlias = {
      address: addressUtils.nodeAddressForEthAddress(ethAddress),
      description: ethAddress,
    };
    
    const linkedAccount = ledger.accountByAddress(ethAlias.address);
    
    if (linkedAccount) {
      return;
    }
  
    ledger.addAlias(baseIdentityId, ethAlias);
    ledger.activate(baseIdentityId);
  })
  
  await fs.writeFile(LEDGER_PATH, ledger.serialize())
})()
