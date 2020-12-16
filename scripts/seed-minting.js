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
const MINT_TX_HASH = "https://etherscan.io/tx/0xfa3923cdb25ab722a98a0ba72cb5b42999ec74baac1113a1ebf12b50906baca1"
const MINT_DATE = "Dec 11, 2020"

const LAST_MINTING = [
  { "address": "0x9453B4eF4806D718c3ABa920FbE3C07f3D6e6086", "amount": 217.3446 },
  { "address": "0x701d0ECB3BA780De7b2b36789aEC4493A426010a", "amount": 250.9917 },
  { "address": "0x8F942ECED007bD3976927B7958B50Df126FEeCb5", "amount": 146.4438 },
  { "address": "0x66b1De0f14a0ce971F7f248415063D44CAF19398", "amount": 2.9036 },
  { "address": "0x4F104B730C517FEB4C4863742D655cF690F85eeE", "amount": 2.8210 },
  { "address": "0x6543c99d0e073c140Fd08A741c6cfdcd1449da94", "amount": 0.0089 },
  { "address": "0x2bEBa030cdC9c4a47c5aa657974840428b9fEfAc", "amount": 23.0864 },
  { "address": "0xB53b0255895c4F9E3a185E484e5B674bCCfbc076", "amount": 563.8740 },
  { "address": "0xd26a3F686D43f2A62BA9eaE2ff77e9f516d945B9", "amount": 5.6850 },
  { "address": "0xD3e9D60e4E4De615124D5239219F32946d10151D", "amount": 0.0852 },
  { "address": "0xDF290293C4A4d6eBe38Fd7085d7721041f927E0a", "amount": 38.8240 },
  { "address": "0xe8256119a8621a6ba3c42e807b261840bde77944", "amount": 125.0586 },
  { "address": "0x4194cE73AC3FBBeCE8fFa878c2B5A8C90333E724", "amount": 15.0361 },
  { "address": "0xE68967c95f5A9BCcfDd711A2Cbc23Ec958F147Ef", "amount": 35.5643 },
  { "address": "0x598f44b2d38662ba6a65140eb8dd1cbb2e366bae", "amount": 16.4242 },
  { "address": "0x865c2F85C9fEa1C6Ac7F53de07554D68cB92eD88", "amount": 0.6261 },
  { "address": "0x590D24003D5Ec516502db08E01421ba56a5cd611", "amount": 4.1451 },
  { "address": "0x710E2f9D630516d3aFDd053De584F1fa421e84bC", "amount": 1.2889 },
  { "address": "0xfaCEf700458D4Fc9746F7f3e0d37B462711fF09e", "amount": 52.8663 },
  { "address": "0x8f2Df304FDf70BB480F1B2Acfb7B57830103d8eB", "amount": 7.5755 },
  { "address": "0xf3B1B6e83Be4d55695f1D30ac3D307D9D5CA98ff", "amount": 0.0089 },
  { "address": "0xf8049C8425f9eAb4E2AE9E1D950f9D3F71481882", "amount": 15.6013 },
  { "address": "0x434DeD09939b64CD76BAA81f9A394283D4C71F05", "amount": 0.3415 },
  { "address": "0x8b104344F397aFC33Ee55C743a0FbD7d956201cD", "amount": 0.4972 },
  { "address": "0x0230c6dD5DB1d3F871386A3CE1A5a836b2590044", "amount": 0.3777 },
  { "address": "0xD595634abf15938Db7C1CA7E8923651434379fAf", "amount": 42.1018 },
  { "address": "0xEB22102dB75138F9f5Af6AFf971BB5944D028504", "amount": 0.0851 },
  { "address": "0x6D97d65aDfF6771b31671443a6b9512104312d3D", "amount": 12.8399 },
  { "address": "0x4059457092Cc3812d56676DF6A75fD21204Fbe2F", "amount": 30.1070 },
  { "address": "0xC7bF5DA444C923AAA80d77d288e86F3246dd4170", "amount": 0.0220 },
  { "address": "0x1a9cEe6E1D21c3C09FB83A980EA54299f01920cd", "amount": 5.9488 },
  { "address": "0xE8aDaeA0bA507a28d1309051BecEb4db7Fe377AF", "amount": 15.2277 },
  { "address": "0x4B7C0Da1C299Ce824f55A0190Efb13663442FA2c", "amount": 1.8448 },
  { "address": "0x851fB899dA7F80c211d9B8e5f231FB3BC9eca41a", "amount": 0.0008 },
  { "address": "0x54BeCc7560a7Be76d72ED76a1f5fee6C5a2A7Ab6", "amount": 0.3846 },
  { "address": "0xeC952ED8e7c2AA466cac36fD611D2E87Df1243D7", "amount": 37.5716 },
  { "address": "0xAC49926b990b3cDc66D3F020989F20a1b51744aD", "amount": 1.1425 },
  { "address": "0x91D999f5DC7273df1449e0D02fD70432E7cE9b24", "amount": 0.7829 },
  { "address": "0x949Bba9F1C13F2461835366AEBcb53c852dd4308", "amount": 0.0026 },
  { "address": "0x9315D886eA870f47E1619743Df8c6e46b3704A42", "amount": 4.8707 },
  { "address": "0x78Ec73423B222cB225549bab0d0a812d58808Ffd", "amount": 141.7460 },
  { "address": "0x9583648c314CDF666F4F555299dB3B36f5d5b2f9", "amount": 0.0788 },
  { "address": "0x1426FBd146942e153653863cbe633780c17268DA", "amount": 10.1766 },
  { "address": "0xE04885c3f1419C6E8495C33bDCf5F8387cd88846", "amount": 11.3740 },
  { "address": "0xDA5b2cd0d0Bb26E79FB3210233dDABdB7de131C9", "amount": 119.4237 },
  { "address": "0x069e85D4F1010DD961897dC8C095FBB5FF297434", "amount": 0.4957 },
  { "address": "0xb5eb4f91b531b9566C32FDFC23B28e81Bd0314a7", "amount": 0.0050 },
  { "address": "0xaD70fE9711b8E12ff806daE5498516FA65f3cD44", "amount": 3.2350 },
  { "address": "0x0B0eFad4aE088a88fFDC50BCe5Fb63c6936b9220", "amount": 0.2646 },
  { "address": "0xced20757aEaB2d2C8825a5CE47Fa52edA1410dC5", "amount": 2.2332 },
  { "address": "0x6ED7F81208839E31E11840049201201C469a7A56", "amount": 1.5428 },
  { "address": "0x85a363699c6864248a6ffca66e4a1a5ccf9f5567", "amount": 29.2995 },
  { "address": "0xA68E0b444E7F5242e48Cea2447FcE03Cb7B8AD16", "amount": 47.9715 },
  { "address": "0x59F68354aD2d495d7C349C63cc80EC2683ab8b22", "amount": 4.5758 },
  { "address": "0x4B037687c1C5159285A7DefAD3681f8e123D2478", "amount": 14.8469 },
  { "address": "0x224aBa5D489675a7bD3CE07786FAda466b46FA0F", "amount": 4.0483 },
  { "address": "0x79b92357bB57a449394A877bA673BdC00194E274", "amount": 0.0082 },
  { "address": "0xce3696f3b57db19e5ebe014aa2d5636e87f9f22d", "amount": 38.9799 },
  { "address": "0x4146A7157Df361A3e82f23811ed56056383555c7", "amount": 75.2701 },
  { "address": "0x20EFCd9B9ADe8bd586f840c83A6d8dd8C1D6623B", "amount": 9.0080 },
  { "address": "0x2920620b47d51170319a531a2d6d5810610e8c2a", "amount": 1.2974 },
  { "address": "0x1e9c89aFf77215F3AD26bFfe0C50d4FdEBa6a352", "amount": 6.1408 },
  { "address": "0x2420be5214E8C83F04F0EF1772254355e2249283", "amount": 7.4296 },
  { "address": "0x8652cb640F8A146bA470972B1cfFEE34E965B847", "amount": 0.0193 },
  { "address": "0xeE03446E9654697685E82BcafeE1e3cB0Aa6f315", "amount": 20.5073 },
  { "address": "0x0be0ecc301a1c0175f07a66243cff628c24db852", "amount": 9.5176 },
  { "address": "0x1E2058Ca360F4EfD61B8f36a38d77D40155e9427", "amount": 2.1241 },
  { "address": "0x8e4Bdd156e4dD802dd919F4FD2645681CE99a538", "amount": 15.0707 },
  { "address": "0xA82BcD1BA56b4BB0f46Bc29dA53413c73Be27509", "amount": 15.4224 },
  { "address": "0x59B917a9e10ECe44faE8b651F8C351ef2647dccA", "amount": 128.3341 },
  { "address": "0xdab19c416355783011724a9c0e4e1e98c648214f", "amount": 440.8207 }
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
    if (!account) {
      console.warn('Missing account for: ', mint)
    }
    const seedsMinted = G.fromApproximateFloat(mint.amount);
    const seedsBalance = G.fromString(account.balance);
    // console.log({ seedsBalance, seedsMinted, mint });
  
    let transferAmount = seedsMinted;
    // Only transfer up to max balance
    if (G.lt(seedsBalance, seedsMinted)) {
      console.log(`Extra SEED Balance for: ${account.ethAddress}: ${G.sub(seedsMinted, seedsBalance)}`)
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
  
  deductSeedsAlreadyMinted([...discordAccWithAddress, ...depAccounts], ledger);
  await fs.writeFile(LEDGER_PATH, ledger.serialize())
  //
  // const newMintAmounts = [];
  // discordAccWithAddress.forEach(acc => {
  //   const amountToMint = G.format(acc.balance, 4, '');
  //   newMintAmounts.push([acc.identity.name, acc.ethAddress, amountToMint]);
  // })
  //
  // DEPENDENCY_ACCOUNTS.forEach(dep => {
  //   const acc = ledger.account(dep.identity.id);
  //   const amountToMint = G.format(acc.balance, 4, '');
  //   newMintAmounts.push([dep.name, dep.ethAddress, amountToMint]);
  // })
  // console.log(newMintAmounts.map(e => e.join(",")).join("\n"));
  
})()
