const sc = require('sourcecred').default;
const fs = require("fs-extra")
const _ = require('lodash');
const fetch = require('node-fetch');

const Ledger = sc.ledger.ledger.Ledger;
const G = sc.ledger.grain;

const NodeAddress = sc.core.address.makeAddressModule({
  name: "NodeAddress",
  nonce: "N",
  otherNonces: new Map().set("E", "EdgeAddress"),
});

// Original Distribution TX Hash: https://etherscan.io/tx/0x6969d6dbaae8db0abc62d7efb1ba23bcbd371cd9b2d6263137975e87bfd431dc
// Second Distribution TX Hash: https://etherscan.io/tx/0x32026b7e0321b22e6cfb4a2cf35c21e5be1198638d404ab2756b9d58b3d1b84f
// Third Distribution TX Hash: https://etherscan.io/tx/0x69fef3f55bd7f561be76c1b86f3a3914f87aed1c4c0a04d387053d17b8d0c12e
const MINT_TX_HASH = "https://etherscan.io/tx/0x69fef3f55bd7f561be76c1b86f3a3914f87aed1c4c0a04d387053d17b8d0c12e"
const MINT_DATE = "November 8, 2020"

const LAST_MINTING = [
  { address: "0x8f942eced007bd3976927b7958b50df126feecb5", amount: 348.4453 },
  { address: "0x66b1de0f14a0ce971f7f248415063d44caf19398", amount: 1.9694 },
  { address: "0x4f104b730c517feb4c4863742d655cf690f85eee", amount: 14.9406 },
  { address: "0x6543c99d0e073c140fd08a741c6cfdcd1449da94", amount: 107.3379 },
  { address: "0x2beba030cdc9c4a47c5aa657974840428b9fefac", amount: 3.3013 },
  { address: "0xB53b0255895c4F9E3a185E484e5B674bCCfbc076", amount: 606.4048 },
  { address: "0xd26a3f686d43f2a62ba9eae2ff77e9f516d945b9", amount: 293.8544 },
  { address: "0xd3e9d60e4e4de615124d5239219f32946d10151d", amount: 11.4743 },
  { address: "0xdf290293c4a4d6ebe38fd7085d7721041f927e0a", amount: 21.6887 },
  { address: "0x4194ce73ac3fbbece8ffa878c2b5a8c90333e724", amount: 13.6596 },
  { address: "0xe68967c95f5a9bccfdd711a2cbc23ec958f147ef", amount: 32.5889 },
  { address: "0x598f44b2d38662ba6a65140eb8dd1cbb2e366bae", amount: 4.4458 },
  { address: "0x865c2f85c9fea1c6ac7f53de07554d68cb92ed88", amount: 7.0775 },
  { address: "0x590d24003d5ec516502db08e01421ba56a5cd611", amount: 7.1349 },
  { address: "0x710e2f9d630516d3afdd053de584f1fa421e84bc", amount: 21.9217 },
  { address: "0xfacef700458d4fc9746f7f3e0d37b462711ff09e", amount: 19.4835 },
  { address: "0x8f2df304fdf70bb480f1b2acfb7b57830103d8eb", amount: 13.7814 },
  { address: "0xf3b1b6e83be4d55695f1d30ac3d307d9d5ca98ff", amount: 126.7359 },
  { address: "0xf8049C8425f9eAb4E2AE9E1D950f9D3F71481882", amount: 7.5414 },
  { address: "0x434ded09939b64cd76baa81f9a394283d4c71f05", amount: 3.4786 },
  { address: "0x8b104344f397afc33ee55c743a0fbd7d956201cd", amount: 3.7507 },
  { address: "0x0230c6dd5db1d3f871386a3ce1a5a836b2590044", amount: 38.6104 },
  { address: "0xd595634abf15938db7c1ca7e8923651434379faf", amount: 18.7026 },
  { address: "0xeb22102db75138f9f5af6aff971bb5944d028504", amount: 25.2036 },
  { address: "0x6d97d65adff6771b31671443a6b9512104312d3d", amount: 17.1173 },
  { address: "0x4059457092cc3812d56676df6a75fd21204fbe2f", amount: 5.2891 },
  { address: "0xc7bf5da444c923aaa80d77d288e86f3246dd4170", amount: 0.0811 },
  { address: "0x1a9cee6e1d21c3c09fb83a980ea54299f01920cd", amount: 3.0968 },
  { address: "0xe8adaea0ba507a28d1309051beceb4db7fe377af", amount: 14.1725 },
  { address: "0xaa01dec5307cf17f20881a3286dcaa062578cea7", amount: 0.0005 },
  { address: "0x4b7c0da1c299ce824f55a0190efb13663442fa2c", amount: 0.8819 },
  { address: "0x851fb899da7f80c211d9b8e5f231fb3bc9eca41a", amount: 0.1634 },
  { address: "0x54becc7560a7be76d72ed76a1f5fee6c5a2a7ab6", amount: 2.3057 },
  { address: "0xec952ed8e7c2aa466cac36fd611d2e87df1243d7", amount: 3.6686 },
  { address: "0xac49926b990b3cdc66d3f020989f20a1b51744ad", amount: 26.7721 },
  { address: "0x91d999f5dc7273df1449e0d02fd70432e7ce9b24", amount: 1.5771 },
  { address: "0x949bba9f1c13f2461835366aebcb53c852dd4308", amount: 0.4028 },
  { address: "0x9315d886ea870f47e1619743df8c6e46b3704a42", amount: 7.7824 },
  { address: "0xff0dca219a54767eecb5a0ff4382ccb938311ff8", amount: 136.4932 },
  { address: "0x9583648c314cdf666f4f555299db3b36f5d5b2f9", amount: 3.5338 },
  { address: "0x1426fbd146942e153653863cbe633780c17268da", amount: 6.673 },
  { address: "0xda5b2cd0d0bb26e79fb3210233ddabdb7de131c9", amount: 91.4713 },
  { address: "0x069e85d4f1010dd961897dc8c095fbb5ff297434", amount: 0.1409 },
  { address: "0xb5eb4f91b531b9566c32fdfc23b28e81bd0314a7", amount: 0.9623 },
  { address: "0xad70fe9711b8e12ff806dae5498516fa65f3cd44", amount: 1.5767 },
  { address: "0x0B0eFad4aE088a88fFDC50BCe5Fb63c6936b9220", amount: 2.4523 },
  { address: "0x224aba5d489675a7bd3ce07786fada466b46fa0f", amount: 3.4824 },
  { address: "0x79b92357bb57a449394a877ba673bdc00194e274", amount: 1.4273 },
  { address: "0x20efcd9b9ade8bd586f840c83a6d8dd8c1d6623b", amount: 4.1124 },
  { address: "0x2920620b47d51170319a531a2d6d5810610e8c2a", amount: 5.0309 },
  { address: "0x1e9c89aff77215f3ad26bffe0c50d4fdeba6a352", amount: 116.1366 },
  { address: "0x2420be5214e8c83f04f0ef1772254355e2249283", amount: 59.66 },
  { address: "0x8652cb640f8a146ba470972b1cffee34e965b847", amount: 2.3894 },
  { address: "0x59b917a9e10ece44fae8b651f8c351ef2647dcca", amount: 288.9034 },
];

const DEPENDENCY_ACCOUNTS = [
  { name: "SourceCred", ethAddress: "0x59B917a9e10ECe44faE8b651F8C351ef2647dccA", identity: { id: "f2ezOIpbLmbDTmQ7QrD7Ig" } },
  { name: "MetaFam DAO", ethAddress: "0xdab19c416355783011724a9c0e4e1e98c648214f", identity: { id: "tyZ49zRqcVU4dHbgr9pkvg" } }
]

const LEDGER_PATH = 'data/ledger.json';
const address_book_file = "https://raw.githubusercontent.com/MetaFam/TheSource/master/addressbook.json"
const ETH_MAIN_NET_IDENTITY_ID = "igdEDIOoos50r4YUKKRQxg";

function deductSeedsAlreadyMinted(accounts, ledger) {
  LAST_MINTING.forEach(mint => {
    const account = accounts.find(a => a.ethAddress.toLowerCase() === mint.address.toLowerCase());
    const seedsMinted = G.fromApproximateFloat(mint.amount);
    const seedsBalance = G.fromString(account.balance);
    console.log({ seedsBalance, seedsMinted, mint });
  
    let transferAmount = seedsMinted;
    // Only transfer up to max balance
    if (G.lt(seedsBalance, seedsMinted)) {
      transferAmount = seedsBalance;
    }
    ledger.transferGrain({ from: account.identity.id, to: ETH_MAIN_NET_IDENTITY_ID, amount: transferAmount, memo: `Minted SEED on chain to ${account.ethAddress} on ${MINT_DATE} (${MINT_TX_HASH})` })
  })
}

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
  
  const depAccounts = DEPENDENCY_ACCOUNTS.map(dep => ({
    ...(ledger.account(dep.identity.id)),
    ...dep,
  }))
  
  // deductSeedsAlreadyMinted([...discordAccWithAddress, ...depAccounts], ledger);
  // await fs.writeFile(LEDGER_PATH, ledger.serialize())
  
  const newMintAmounts = [];
  discordAccWithAddress.forEach(acc => {
    const amountToMint = G.format(acc.balance, 4, '');
    newMintAmounts.push([acc.identity.name, acc.ethAddress, amountToMint]);
  })

  DEPENDENCY_ACCOUNTS.forEach(dep => {
    const acc = ledger.account(dep.identity.id);
    const amountToMint = G.format(acc.balance, 4, '');
    newMintAmounts.push([dep.name, dep.ethAddress, amountToMint]);
  })
  console.log(newMintAmounts.map(e => e.join(",")).join("\n"));
  
})()
