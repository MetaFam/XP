const sc = require('sourcecred-publish-test').sourcecred;
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
// Fourth Distribution TX Hash: https://etherscan.io/tx/0xca3b6a5291e249a9bf63dc384a0b697f38f9a03f37ad01fdfed0b25ded8b87d9
const MINT_TX_HASH = ""
const MINT_DATE = ""

const LAST_MINTING = [
  { address: "0x9453B4eF4806D718c3ABa920FbE3C07f3D6e6086", amount: 0.1080 },
  { address: "0x701d0ECB3BA780De7b2b36789aEC4493A426010a", amount: 15.4601 },
  { address: "0x8F942ECED007bD3976927B7958B50Df126FEeCb5", amount: 218.8361 },
  { address: "0x66b1De0f14a0ce971F7f248415063D44CAF19398", amount: 6.6959 },
  { address: "0x4F104B730C517FEB4C4863742D655cF690F85eeE", amount: 0.0142 },
  { address: "0x6543c99d0e073c140Fd08A741c6cfdcd1449da94", amount: 0.0023 },
  { address: "0x2bEBa030cdC9c4a47c5aa657974840428b9fEfAc", amount: 32.4484 },
  { address: "0xB53b0255895c4F9E3a185E484e5B674bCCfbc076", amount: 287.6798 },
  { address: "0xd26a3F686D43f2A62BA9eaE2ff77e9f516d945B9", amount: 1.5491 },
  { address: "0xC0aB27EfB55821ae7b11027a510b8F8eEBfb766D", amount: 48.7223 },
  { address: "0xEEc76b015DaD397ff8455d4533a26BEa6866D188", amount: 21.4713 },
  { address: "0xD3e9D60e4E4De615124D5239219F32946d10151D", amount: 0.0726 },
  { address: "0xDF290293C4A4d6eBe38Fd7085d7721041f927E0a", amount: 11.6588 },
  { address: "0xe8256119a8621a6ba3c42e807b261840bde77944", amount: 11.9564 },
  { address: "0x4194cE73AC3FBBeCE8fFa878c2B5A8C90333E724", amount: 70.8965 },
  { address: "0xE68967c95f5A9BCcfDd711A2Cbc23Ec958F147Ef", amount: 20.3367 },
  { address: "0x598f44b2d38662ba6a65140eb8dd1cbb2e366bae", amount: 1.6523 },
  { address: "0x865c2F85C9fEa1C6Ac7F53de07554D68cB92eD88", amount: 0.2488 },
  { address: "0x590D24003D5Ec516502db08E01421ba56a5cd611", amount: 0.7712 },
  { address: "0x710E2f9D630516d3aFDd053De584F1fa421e84bC", amount: 1.3580 },
  { address: "0xfaCEf700458D4Fc9746F7f3e0d37B462711fF09e", amount: 72.0160 },
  { address: "0x8f2Df304FDf70BB480F1B2Acfb7B57830103d8eB", amount: 0.9834 },
  { address: "0xf3B1B6e83Be4d55695f1D30ac3D307D9D5CA98ff", amount: 0.0022 },
  { address: "0xf8049C8425f9eAb4E2AE9E1D950f9D3F71481882", amount: 11.8806 },
  { address: "0x434DeD09939b64CD76BAA81f9A394283D4C71F05", amount: 0.1161 },
  { address: "0x8b104344F397aFC33Ee55C743a0FbD7d956201cD", amount: 0.1932 },
  { address: "0x0230c6dD5DB1d3F871386A3CE1A5a836b2590044", amount: 0.1512 },
  { address: "0xD595634abf15938Db7C1CA7E8923651434379fAf", amount: 13.1754 },
  { address: "0xEB22102dB75138F9f5Af6AFf971BB5944D028504", amount: 0.0584 },
  { address: "0x6D97d65aDfF6771b31671443a6b9512104312d3D", amount: 15.8097 },
  { address: "0x4059457092Cc3812d56676DF6A75fD21204Fbe2F", amount: 22.5940 },
  { address: "0xC7bF5DA444C923AAA80d77d288e86F3246dd4170", amount: 0.0463 },
  { address: "0x1a9cEe6E1D21c3C09FB83A980EA54299f01920cd", amount: 1.3062 },
  { address: "0xE8aDaeA0bA507a28d1309051BecEb4db7Fe377AF", amount: 12.3317 },
  { address: "0xAa01DeC5307CF17F20881A3286dcaA062578cea7", amount: 0.7505 },
  { address: "0x4B7C0Da1C299Ce824f55A0190Efb13663442FA2c", amount: 0.8716 },
  { address: "0x851fB899dA7F80c211d9B8e5f231FB3BC9eca41a", amount: 0.3396 },
  { address: "0x54BeCc7560a7Be76d72ED76a1f5fee6C5a2A7Ab6", amount: 0.1015 },
  { address: "0xeC952ED8e7c2AA466cac36fD611D2E87Df1243D7", amount: 22.0360 },
  { address: "0xAC49926b990b3cDc66D3F020989F20a1b51744aD", amount: 0.3844 },
  { address: "0x91D999f5DC7273df1449e0D02fD70432E7cE9b24", amount: 1.4480 },
  { address: "0x949Bba9F1C13F2461835366AEBcb53c852dd4308", amount: 0.0030 },
  { address: "0x9315D886eA870f47E1619743Df8c6e46b3704A42", amount: 6.8082 },
  { address: "0x78Ec73423B222cB225549bab0d0a812d58808Ffd", amount: 177.0235 },
  { address: "0x9583648c314CDF666F4F555299dB3B36f5d5b2f9", amount: 0.0663 },
  { address: "0x1426FBd146942e153653863cbe633780c17268DA", amount: 13.3105 },
  { address: "0xE04885c3f1419C6E8495C33bDCf5F8387cd88846", amount: 3.2110 },
  { address: "0x0a8395c74b4048f1a40ea8c11b7e946a5ff93561", amount: 11.4009 },
  { address: "0xDA5b2cd0d0Bb26E79FB3210233dDABdB7de131C9", amount: 107.3490 },
  { address: "0x069e85D4F1010DD961897dC8C095FBB5FF297434", amount: 1.8088 },
  { address: "0xceBd2Dd19c911761674BC2344DceD8EC8148D19f", amount: 37.7467 },
  { address: "0xb5eb4f91b531b9566C32FDFC23B28e81Bd0314a7", amount: 0.0073 },
  { address: "0x4660a5C239D732F4910062D0D44747a7613E4f00", amount: 13.6448 },
  { address: "0x0B0eFad4aE088a88fFDC50BCe5Fb63c6936b9220", amount: 0.1621 },
  { address: "0xced20757aEaB2d2C8825a5CE47Fa52edA1410dC5", amount: 0.4258 },
  { address: "0x6ED7F81208839E31E11840049201201C469a7A56", amount: 0.2597 },
  { address: "0xCb5Fba4419ABC4D7C11af0C24BA0F2e555407F5b", amount: 9.5081 },
  { address: "0x85a363699c6864248a6ffca66e4a1a5ccf9f5567", amount: 3.1051 },
  { address: "0x5ea7ea516720a8f59c9d245e2e98bca0b6df7441", amount: 23.7892 },
  { address: "0xA68E0b444E7F5242e48Cea2447FcE03Cb7B8AD16", amount: 53.4764 },
  { address: "0x4052336e4B1a6F05d15a90E8ce8A0A4C4D512243", amount: 11.4912 },
  { address: "0x59F68354aD2d495d7C349C63cc80EC2683ab8b22", amount: 1.3060 },
  { address: "0x4B037687c1C5159285A7DefAD3681f8e123D2478", amount: 5.0822 },
  { address: "0x224aBa5D489675a7bD3CE07786FAda466b46FA0F", amount: 2.1353 },
  { address: "0x79b92357bB57a449394A877bA673BdC00194E274", amount: 0.3452 },
  { address: "0x8760E565273B47195F76A22455Ce0B68A11aF5B5", amount: 28.9410 },
  { address: "0xAB5b57832498a2B541AAA2c448e2E79d872564E0", amount: 9.6722 },
  { address: "0xce3696f3b57db19e5ebe014aa2d5636e87f9f22d", amount: 13.0857 },
  { address: "0x3e4B249281B4F25439Be64B42Fd65F952E0bfD04", amount: 3.2489 },
  { address: "0x4146A7157Df361A3e82f23811ed56056383555c7", amount: 17.1155 },
  { address: "0x20EFCd9B9ADe8bd586f840c83A6d8dd8C1D6623B", amount: 13.7435 },
  { address: "0x5202E694e9Fc9B097549619236f5EE3d059a4e95", amount: 9.7576 },
  { address: "0x8C4Cc36bC8F304F41a5aB18f773CFc4Fd6DBa2ed", amount: 1.1095 },
  { address: "0x164bA6d1E6DD5F937908C34137D271ea3852C214", amount: 3.0857 },
  { address: "0x2920620b47d51170319a531a2d6d5810610e8c2a", amount: 1.9575 },
  { address: "0x1e9c89aFf77215F3AD26bFfe0C50d4FdEBa6a352", amount: 47.0010 },
  { address: "0x2420be5214E8C83F04F0EF1772254355e2249283", amount: 64.7322 },
  { address: "0x8652cb640F8A146bA470972B1cfFEE34E965B847", amount: 0.0096 },
  { address: "0x7b39AFdB75Fd542BD7104cDea462f9773A63855D", amount: 6.7773 },
  { address: "0x7Eb97437FDFa3e42C13eB36f2D61E2D12Fd3aB02", amount: 35.0362 },
  { address: "0xeE03446E9654697685E82BcafeE1e3cB0Aa6f315", amount: 8.4194 },
  { address: "0x0be0ecc301a1c0175f07a66243cff628c24db852", amount: 1.9391 },
  { address: "0x9eEC0B5Bd8A48047f0Dcc61E98B4b92951480F98", amount: 3.1932 },
  { address: "0x152ad2E12E102aBF64280C5e3d70257EFfb0EDe0", amount: 23.7436 },
  { address: "0x8e4Bdd156e4dD802dd919F4FD2645681CE99a538", amount: 63.7497 },
  { address: "0xD5823AB44Db9a0659027f0FEA428534B9C13015B", amount: 71.2862 },
  { address: "0x9Eee6B4683340EfDF05589466e24f69C017BF64e", amount: 3.8072 },
  { address: "0x36de990133D36d7E3DF9a820aA3eDE5a2320De71", amount: 0.9367 },
  { address: "0x436Bb9e1f02C9cA7164afb5753C03c071430216d", amount: 3.3228 },
  { address: "0x3D02E6aE6ABBeb2f135Ef676734d1ae2BCe75c17", amount: 4.6289 },
  { address: "0x6Bc842966e4dE1733644905f8F0b10Ad4AA0C000", amount: 42.6249 },
  { address: "0x986e92868A27548a31e88f7692E746CD7E86f39a", amount: 7.3581 },
  { address: "0x2a87C1345024ab463ACC26417124C433b3069fdD", amount: 8.2955 },
  { address: "0x48A63097E1Ac123b1f5A8bbfFafA4afa8192FaB0", amount: 2.9418 },
  { address: "0x091fCbB9186f392610740038Ea5b8007fE7674e4", amount: 1.0932 },
  { address: "0xe3fD0c0704A7002056eA10332825CB72094495A8", amount: 38.3549 },
  { address: "0xA82BcD1BA56b4BB0f46Bc29dA53413c73Be27509", amount: 13.2864 },
  { address: "0xC316319950bf01E18748Ed807c05cBe64d48DA6b", amount: 35.5075 },
  { address: "0x98753E5f9Cd76B46cbD95Bf16D166FAeE1a7720B", amount: 39.9568 },
  { address: "0xA54017a082492740BbC99168A512abcC2C3e3ac7", amount: 29.0976 },
  { address: "0xaD7E79A81296aCFdBE8C41804f8348908C23EaBE", amount: 31.4646 },
  { address: "0xDC546f477f273bCF327297bf4ADCB671b5f20BE1", amount: 20.3564 },
  { address: "0x59171b87817C5F07157066Bd5284707A711229B3", amount: 5.5941 },
  { address: "0xe871C29AD43856fcaC45492AF664858999Bc7fDd", amount: 2.7476 },
  { address: "0x62Ff40ca6899b6DdF0129e8f88319afD0F85f23F", amount: 2.1099 },
  { address: "0xbCa02EDeBb39e215d1896a11A5c9BFB0e6A22795", amount: 8.3187 },
  { address: "0x7783Bf3728513Fef0353e5fEa79E48e6EE7ca221", amount: 2.8032 },
  { address: "0xB232b2B6129Bf05454A197C985d3e587D70F40de", amount: 0.9652 },
  { address: "0x4c1546B2D87eCE5Be3429df8d5F7987CE3C2fD45", amount: 4.4212 },
  { address: "0x7b5f48e540a08dDE521A663D887F88F77e3b5387", amount: 0.0013 },
  { address: "0x59B917a9e10ECe44faE8b651F8C351ef2647dccA", amount: 105.1691 },
  { address: "0xdab19c416355783011724a9c0e4e1e98c648214f", amount: 58.8300 }
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
  
    const ethAliases = a.identity.aliases.filter(alias => {
      const parts = NodeAddress.toParts(alias.address);
      return parts.indexOf('ethereum') > 0;
    })
    
    if (!discordAliases.length && !ethAliases.length) return null;
    
    let user = null;
    let discordId = null;
    let ethAddress = null;
    
    discordAliases.forEach(alias => {
      discordId = NodeAddress.toParts(alias.address)[4];
      if (AddressMap[discordId]) {
        user = AddressMap[discordId]
      }
    })
  
    ethAliases.forEach(alias => {
      ethAddress = NodeAddress.toParts(alias.address)[2];
      console.log({ ethAddress });
    })
  
    
    return {
      ...a,
      discordId,
      cred: credAcc.totalCred,
      ethAddress: ethAddress || (user && user.address),
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
  let total = 0;
  discordAccWithAddress.forEach(acc => {
    const amountToMint = G.format(acc.balance, 4, '');
    newMintAmounts.push([acc.ethAddress, amountToMint]);
    total += parseFloat(amountToMint);
  })

  DEPENDENCY_ACCOUNTS.forEach(dep => {
    const acc = ledger.account(dep.identity.id);
    const amountToMint = G.format(acc.balance, 4, '');
    newMintAmounts.push([dep.ethAddress, amountToMint]);
    total += parseFloat(amountToMint);
  })
  
  console.log(newMintAmounts.map(([address, amount]) => `${address},${amount}`).join('\n'));
  console.log({ total });
  
})()
