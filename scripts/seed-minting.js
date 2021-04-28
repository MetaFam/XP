const sc = require('sourcecred-publish-test').sourcecred;
const fs = require("fs-extra");
const Web3 = require('web3');
const isValidAddress = require('web3-utils').isAddress;
const _ = require('lodash');
const fetch = require('node-fetch');

const Ledger = sc.ledger.ledger.Ledger;
const G = sc.ledger.grain;

const web3 = new Web3(new Web3.providers.HttpProvider(
  'https://mainnet.infura.io/v3/43dd12c4245b4924b4a29cea5afa18ef:8545'));


const NodeAddress = sc.core.address.makeAddressModule({
  name: "NodeAddress",
  nonce: "N",
  otherNonces: new Map().set("E", "EdgeAddress"),
});

const numberToWei = (n) => web3.utils.toWei(parseFloat(n).toFixed(9), 'ether');


// Original Distribution TX Hash: https://etherscan.io/tx/0x6969d6dbaae8db0abc62d7efb1ba23bcbd371cd9b2d6263137975e87bfd431dc
// Second Distribution TX Hash: https://etherscan.io/tx/0x32026b7e0321b22e6cfb4a2cf35c21e5be1198638d404ab2756b9d58b3d1b84f
// Third Distribution TX Hash: https://etherscan.io/tx/0x69fef3f55bd7f561be76c1b86f3a3914f87aed1c4c0a04d387053d17b8d0c12e
// Fourth Distribution TX Hash: https://etherscan.io/tx/0xca3b6a5291e249a9bf63dc384a0b697f38f9a03f37ad01fdfed0b25ded8b87d9
// Fourth Distribution TX Hash: https://etherscan.io/tx/0xca3b6a5291e249a9bf63dc384a0b697f38f9a03f37ad01fdfed0b25ded8b87d9
// Fifth Distribution (Merkle):
//      TX: https://etherscan.io/tx/0xb748b1a74155bab8734c340935e54025c0e48f4c22ad8233c5efe4ccb9f3a628
//      Merkle Root: https://storageapi.fleek.co/hammadj-team-bucket/seed-claim/seedMerkle1.json

const MINT_TX_HASH = "https://etherscan.io/tx/0xb748b1a74155bab8734c340935e54025c0e48f4c22ad8233c5efe4ccb9f3a628";
const MINT_DATE = "Mar 18 2021";

const LAST_MINTING = [
  { address: "0x9453B4eF4806D718c3ABa920FbE3C07f3D6e6086", amount: "0.032461289" },
  { address: "0x701d0ECB3BA780De7b2b36789aEC4493A426010a", amount: "30.516722678" },
  { address: "0x8F942ECED007bD3976927B7958B50Df126FEeCb5", amount: "0.000081646" },
  { address: "0x66b1De0f14a0ce971F7f248415063D44CAF19398", amount: "19.900096012" },
  { address: "0x4F104B730C517FEB4C4863742D655cF690F85eeE", amount: "0.054284595" },
  { address: "0x6543c99d0e073c140Fd08A741c6cfdcd1449da94", amount: "0.307806607" },
  { address: "0x74ECD3d9d124b39cAD14Fb69e381DB7121A7998f", amount: "37.013478365" },
  { address: "0x2bEBa030cdC9c4a47c5aa657974840428b9fEfAc", amount: "27.324961522" },
  { address: "0xB53b0255895c4F9E3a185E484e5B674bCCfbc076", amount: "514.249835491" },
  { address: "0xd26a3F686D43f2A62BA9eaE2ff77e9f516d945B9", amount: "0.572052052" },
  { address: "0xC0aB27EfB55821ae7b11027a510b8F8eEBfb766D", amount: "2.416692799" },
  { address: "0xEEc76b015DaD397ff8455d4533a26BEa6866D188", amount: "0.093815476" },
  { address: "0xD3e9D60e4E4De615124D5239219F32946d10151D", amount: "8.571280208" },
  { address: "0xDF290293C4A4d6eBe38Fd7085d7721041f927E0a", amount: "33.230594849" },
  { address: "0xE8256119A8621a6Ba3c42e807B261840bDe77944", amount: "1.961676982" },
  { address: "0x4194cE73AC3FBBeCE8fFa878c2B5A8C90333E724", amount: "231.240368264" },
  { address: "0xE68967c95f5A9BCcfDd711A2Cbc23Ec958F147Ef", amount: "10.490683157" },
  { address: "0x598f44b2d38662Ba6a65140eB8Dd1cbb2E366BAE", amount: "0.103980675" },
  { address: "0x865c2F85C9fEa1C6Ac7F53de07554D68cB92eD88", amount: "0.038192061" },
  { address: "0x590D24003D5Ec516502db08E01421ba56a5cd611", amount: "0.049553755" },
  { address: "0x710E2f9D630516d3aFDd053De584F1fa421e84bC", amount: "4.675743057" },
  { address: "0xfaCEf700458D4Fc9746F7f3e0d37B462711fF09e", amount: "136.011284806" },
  { address: "0x8f2Df304FDf70BB480F1B2Acfb7B57830103d8eB", amount: "0.227434683" },
  { address: "0x6a1cf24C645DB2e37141Fa12E70Cb67e56b336f3", amount: "50.680160516" },
  { address: "0xf3B1B6e83Be4d55695f1D30ac3D307D9D5CA98ff", amount: "0.009308589" },
  { address: "0xf8049C8425f9eAb4E2AE9E1D950f9D3F71481882", amount: "6.935298355" },
  { address: "0x434DeD09939b64CD76BAA81f9A394283D4C71F05", amount: "0.041481188" },
  { address: "0xf97664376416E9379f2354DB444BFE3f00B6936b", amount: "4.691760413" },
  { address: "0x8b104344F397aFC33Ee55C743a0FbD7d956201cD", amount: "2.575155224" },
  { address: "0xf83775C95A00612D4CAc5053Dd484FfA81BaE0aD", amount: "2.841450281" },
  { address: "0x0230c6dD5DB1d3F871386A3CE1A5a836b2590044", amount: "0.080835696" },
  { address: "0xD595634abf15938Db7C1CA7E8923651434379fAf", amount: "2.744711447" },
  { address: "0xEB22102dB75138F9f5Af6AFf971BB5944D028504", amount: "0.336257545" },
  { address: "0x68d36DcBDD7Bbf206e27134F28103abE7cf972df", amount: "17.122966818" },
  { address: "0x6D97d65aDfF6771b31671443a6b9512104312d3D", amount: "14.784687279" },
  { address: "0x4059457092Cc3812d56676DF6A75fD21204Fbe2F", amount: "10.218242986" },
  { address: "0xC7bF5DA444C923AAA80d77d288e86F3246dd4170", amount: "0.032196583" },
  { address: "0x1a9cEe6E1D21c3C09FB83A980EA54299f01920cd", amount: "0.186698438" },
  { address: "0xE8aDaeA0bA507a28d1309051BecEb4db7Fe377AF", amount: "7.914651562" },
  { address: "0xAa01DeC5307CF17F20881A3286dcaA062578cea7", amount: "0.697992206" },
  { address: "0x4B7C0Da1C299Ce824f55A0190Efb13663442FA2c", amount: "2.570308285" },
  { address: "0x851fB899dA7F80c211d9B8e5f231FB3BC9eca41a", amount: "0.124235493" },
  { address: "0x54BeCc7560a7Be76d72ED76a1f5fee6C5a2A7Ab6", amount: "0.022272469" },
  { address: "0xeC952ED8e7c2AA466cac36fD611D2E87Df1243D7", amount: "16.712431892" },
  { address: "0xC33290860C1DA6a84195C5cf1575860d3A3ED73d", amount: "176.854221871" },
  { address: "0xAC49926b990b3cDc66D3F020989F20a1b51744aD", amount: "5.911637589" },
  { address: "0x91D999f5DC7273df1449e0D02fD70432E7cE9b24", amount: "59.238535229" },
  { address: "0x949Bba9F1C13F2461835366AEBcb53c852dd4308", amount: "0.033668646" },
  { address: "0x9315D886eA870f47E1619743Df8c6e46b3704A42", amount: "44.877584596" },
  { address: "0x78Ec73423B222cB225549bab0d0a812d58808Ffd", amount: "295.376886506" },
  { address: "0x9583648c314CDF666F4F555299dB3B36f5d5b2f9", amount: "0.016736551" },
  { address: "0x1426FBd146942e153653863cbe633780c17268DA", amount: "45.553138210" },
  { address: "0xE04885c3f1419C6E8495C33bDCf5F8387cd88846", amount: "1.054107400" },
  { address: "0x0a8395c74b4048F1a40ea8c11B7E946A5fF93561", amount: "0.237822619" },
  { address: "0xDA5b2cd0d0Bb26E79FB3210233dDABdB7de131C9", amount: "147.538648697" },
  { address: "0x069e85D4F1010DD961897dC8C095FBB5FF297434", amount: "9.464187545" },
  { address: "0xceBd2Dd19c911761674BC2344DceD8EC8148D19f", amount: "7.590724521" },
  { address: "0xb5eb4f91b531b9566C32FDFC23B28e81Bd0314a7", amount: "0.009004528" },
  { address: "0x6c379474d8ac313676945a4a7a3a1c590eeC0995", amount: "8.747090424" },
  { address: "0x4660a5C239D732F4910062D0D44747a7613E4f00", amount: "1.563081244" },
  { address: "0xced20757aEaB2d2C8825a5CE47Fa52edA1410dC5", amount: "0.048613306" },
  { address: "0x317ee88F1b78182c4514371bcBf1488b176FCC5A", amount: "26.139732530" },
  { address: "0xCb5Fba4419ABC4D7C11af0C24BA0F2e555407F5b", amount: "0.143296689" },
  { address: "0x85A363699C6864248a6FfCA66e4a1A5cCf9f5567", amount: "1.476424278" },
  { address: "0x5ea7ea516720a8F59C9d245E2E98bCA0B6DF7441", amount: "35.289469511" },
  { address: "0xA68E0b444E7F5242e48Cea2447FcE03Cb7B8AD16", amount: "67.420774208" },
  { address: "0x4052336e4B1a6F05d15a90E8ce8A0A4C4D512243", amount: "3.618052800" },
  { address: "0x59F68354aD2d495d7C349C63cc80EC2683ab8b22", amount: "4.261332756" },
  { address: "0x4B037687c1C5159285A7DefAD3681f8e123D2478", amount: "0.573828852" },
  { address: "0x224aBa5D489675a7bD3CE07786FAda466b46FA0F", amount: "0.153004472" },
  { address: "0x79b92357bB57a449394A877bA673BdC00194E274", amount: "2.357016413" },
  { address: "0x8760E565273B47195F76A22455Ce0B68A11aF5B5", amount: "114.744601258" },
  { address: "0xAB5b57832498a2B541AAA2c448e2E79d872564E0", amount: "0.296378948" },
  { address: "0xce3696f3B57Db19e5EbE014aA2d5636E87f9f22D", amount: "2.739469530" },
  { address: "0x3e4B249281B4F25439Be64B42Fd65F952E0bfD04", amount: "3.651942792" },
  { address: "0x4146A7157Df361A3e82f23811ed56056383555c7", amount: "6.892327334" },
  { address: "0x20EFCd9B9ADe8bd586f840c83A6d8dd8C1D6623B", amount: "42.004366483" },
  { address: "0x5202E694e9Fc9B097549619236f5EE3d059a4e95", amount: "1.072213064" },
  { address: "0x8C4Cc36bC8F304F41a5aB18f773CFc4Fd6DBa2ed", amount: "4.554307605" },
  { address: "0x164bA6d1E6DD5F937908C34137D271ea3852C214", amount: "0.032377051" },
  { address: "0x2920620b47D51170319A531A2D6D5810610E8C2A", amount: "0.808018034" },
  { address: "0x1A1c26E4BdFCb7B5442507Da5E1bd0350136595C", amount: "0.000000000" },
  { address: "0x1e9c89aFf77215F3AD26bFfe0C50d4FdEBa6a352", amount: "107.919187273" },
  { address: "0x2420be5214E8C83F04F0EF1772254355e2249283", amount: "109.729107332" },
  { address: "0x8652cb640F8A146bA470972B1cfFEE34E965B847", amount: "0.559775166" },
  { address: "0x7b39AFdB75Fd542BD7104cDea462f9773A63855D", amount: "10.902402502" },
  { address: "0x7Eb97437FDFa3e42C13eB36f2D61E2D12Fd3aB02", amount: "6.216055889" },
  { address: "0xeE03446E9654697685E82BcafeE1e3cB0Aa6f315", amount: "1.620767418" },
  { address: "0x0be0eCC301a1c0175f07A66243cfF628c24DB852", amount: "1.560268102" },
  { address: "0x9eEC0B5Bd8A48047f0Dcc61E98B4b92951480F98", amount: "55.305817846" },
  { address: "0x152ad2E12E102aBF64280C5e3d70257EFfb0EDe0", amount: "14.010104983" },
  { address: "0x8e4Bdd156e4dD802dd919F4FD2645681CE99a538", amount: "227.477729473" },
  { address: "0xD5823AB44Db9a0659027f0FEA428534B9C13015B", amount: "144.807777200" },
  { address: "0x9Eee6B4683340EfDF05589466e24f69C017BF64e", amount: "1.336682172" },
  { address: "0x36de990133D36d7E3DF9a820aA3eDE5a2320De71", amount: "0.720144519" },
  { address: "0x436Bb9e1f02C9cA7164afb5753C03c071430216d", amount: "10.471559379" },
  { address: "0x3D02E6aE6ABBeb2f135Ef676734d1ae2BCe75c17", amount: "0.107026957" },
  { address: "0x6Bc842966e4dE1733644905f8F0b10Ad4AA0C000", amount: "159.736089135" },
  { address: "0x986e92868A27548a31e88f7692E746CD7E86f39a", amount: "19.345422694" },
  { address: "0x2a87C1345024ab463ACC26417124C433b3069fdD", amount: "54.681085734" },
  { address: "0x48A63097E1Ac123b1f5A8bbfFafA4afa8192FaB0", amount: "0.343727357" },
  { address: "0x091fCbB9186f392610740038Ea5b8007fE7674e4", amount: "25.126981879" },
  { address: "0x408E68023E12bfc7d29Ca7d3656395d3dE0749e0", amount: "2.325094892" },
  { address: "0xe3fD0c0704A7002056eA10332825CB72094495A8", amount: "8.794600437" },
  { address: "0x62c911a24E0402F4d6cf433004428248396e28b7", amount: "3.203847439" },
  { address: "0xA82BcD1BA56b4BB0f46Bc29dA53413c73Be27509", amount: "15.644778484" },
  { address: "0xC316319950bf01E18748Ed807c05cBe64d48DA6b", amount: "4.928925091" },
  { address: "0x98753E5f9Cd76B46cbD95Bf16D166FAeE1a7720B", amount: "6.411831732" },
  { address: "0xA54017a082492740BbC99168A512abcC2C3e3ac7", amount: "4.764625241" },
  { address: "0xaD7E79A81296aCFdBE8C41804f8348908C23EaBE", amount: "126.627630768" },
  { address: "0xDC546f477f273bCF327297bf4ADCB671b5f20BE1", amount: "240.359880818" },
  { address: "0x59171b87817C5F07157066Bd5284707A711229B3", amount: "5.211125597" },
  { address: "0xe871C29AD43856fcaC45492AF664858999Bc7fDd", amount: "8.429524665" },
  { address: "0x62Ff40ca6899b6DdF0129e8f88319afD0F85f23F", amount: "4.284160167" },
  { address: "0x151EaaA48bbD08B7Cc37B52216Cf54f54c41b24b", amount: "23.090418371" },
  { address: "0xbCa02EDeBb39e215d1896a11A5c9BFB0e6A22795", amount: "28.957640711" },
  { address: "0xC561C9b7035732B4EbDbAe6aC43D6a293aB53896", amount: "0.000000000" },
  { address: "0x767E47A828ae99a511029D2f3Db50FE8C3d6964E", amount: "12.951860743" },
  { address: "0x7783Bf3728513Fef0353e5fEa79E48e6EE7ca221", amount: "3.845398493" },
  { address: "0xed8DB37778804A913670d9367aAf4F043AAd938b", amount: "3.229946366" },
  { address: "0xB232b2B6129Bf05454A197C985d3e587D70F40de", amount: "1.846432153" },
  { address: "0x756ee8B8E898D497043c2320d9909f1DD5a7077F", amount: "0.000000000" },
  { address: "0x4c1546B2D87eCE5Be3429df8d5F7987CE3C2fD45", amount: "56.997983704" },
  { address: "0x340A984Bd97dB9D62Cc8bcF1c0B2735ec99855ce", amount: "0.000000000" },
  { address: "0x7b5f48e540a08dDE521A663D887F88F77e3b5387", amount: "3.467724226" },
  { address: "0x1785C69390f5B4F329e22c5BD8BBF7a596e4ab09", amount: "69.991891151" },
  { address: "0x29C4dbC1a81d06c9AA2fAed93Bb8B4a78F3eabDb", amount: "2.324049039" },
  { address: "0x2A8fe25896fCcE82C49c2Db923aBFA4198Ad3394", amount: "25.264562362" },
  { address: "0x8f07f45EB9ab3A2dF97A168143C081a7BC6f0A01", amount: "0.000000000" },
  { address: "0x95E61633f4E1425FF0f79F1131207949Fab2Bc09", amount: "45.353219477" },
  { address: "0xed46a40c088D11546Eb4811e565E88A03ae8a07c", amount: "0.000000000" },
  { address: "0xd6D48727d8835b73F8DC511A5BAaf3445a6F65C9", amount: "6.578949024" },
  { address: "0x0751B77E8AcAEffAD53667c72AA7CE66688d8c61", amount: "0.000000000" },
  { address: "0x37BD0aE78dD5cd338D6E80B5c87B6F8e38121297", amount: "0.000000000" },
  { address: "0xfd3c7eAA9365B67477D46ddb24cB8ba4380Bfd8F", amount: "11.858463849" },
  { address: "0x5e27D0702e5A7C8b37812B1B87B64E8BC8D0e138", amount: "0.000000000" },
  { address: "0x98183836EE2A3ce4A30c067160B5C37F05F0beDA", amount: "18.448014298" },
  { address: "0x9eC62a9c7b54711BcD9B81D660326F25c67A7793", amount: "0.000000000" },
  { address: "0xe1fB7cC343fF8Ae84E7136FB2ceF98A488C59Bb3", amount: "24.843142349" },
  { address: "0xCa6bD9152bD92F6A8E5c991fCc53b24Ca6ee470b", amount: "7.512782377" },
  { address: "0x4dFD08B2B8ab7C8dE88Be6dE522799b47bd5ACb6", amount: "3.221127152" },
  { address: "0x44BF6F5b5A5884E748fc87E10ddC4b6eB3c027C7", amount: "1.259364917" },
  { address: "0x062f901129158536E6F410A80B631C1F88e4809b", amount: "0.000000000" },
  { address: "0x1256E7992564AB22e332532472c916Bd8D1e1Ca7", amount: "1.612403477" },
  { address: "0x3F0F99eC5A55a51C55e2DFb732332437213B5650", amount: "8.200270222" },
  { address: "0x7E4724C60718A9F87CE51bcF8812Bf90D0b7B9Db", amount: "3.106542213" },
  { address: "0xf2e50F2747cE2E5e04D791b7BD501A5CD4673cf0", amount: "6.935080709" },
  { address: "0xD8c7ea3E87A04c26DE0a1Cd21117cf8595a59a46", amount: "2.989718930" },
  { address: "0x73C20bA9812566619E5Abdcb1c709f04549bb83a", amount: "1.186789056" },
  { address: "0x59B917a9e10ECe44faE8b651F8C351ef2647dccA", amount: "244.834149902" },
  { address: "0xdab19c416355783011724a9c0e4e1e98c648214f", amount: "125.239871629" },
];

const DEPENDENCY_ACCOUNTS = [
  {
    name: "SourceCred",
    ethAddress: "0x59B917a9e10ECe44faE8b651F8C351ef2647dccA",
    identity: { id: "f2ezOIpbLmbDTmQ7QrD7Ig" },
  },
  {
    name: "MetaFam DAO",
    ethAddress: "0xdab19c416355783011724a9c0e4e1e98c648214f",
    identity: { id: "tyZ49zRqcVU4dHbgr9pkvg" },
  },
];

const LEDGER_PATH = 'data/ledger.json';
const address_book_file = "https://raw.githubusercontent.com/MetaFam/TheSource/master/addressbook.json";
const ETH_MAIN_NET_IDENTITY_ID = "igdEDIOoos50r4YUKKRQxg";

function deductSeedsAlreadyMinted(accounts, ledger) {
  LAST_MINTING.forEach(mint => {
    const account = accounts.find(a => a.ethAddress.toLowerCase() === mint.address.toLowerCase());
    if (!account) {
      console.warn('Missing account for: ', mint);
    }
    const seedsMinted = G.fromApproximateFloat(mint.amount);
    const seedsBalance = G.fromString(account.balance);
    // console.log({ seedsBalance, seedsMinted, mint });
    
    let transferAmount = seedsMinted;
    // Only transfer up to max balance
    if (G.lt(seedsBalance, seedsMinted)) {
      console.log(`Extra SEED Balance for: ${account.ethAddress}: ${G.sub(seedsMinted, seedsBalance)}`);
      transferAmount = seedsBalance;
    }
    ledger.activate(account.identity.id);
    ledger.transferGrain({
      from: account.identity.id,
      to: ETH_MAIN_NET_IDENTITY_ID,
      amount: transferAmount,
      memo: `Minted SEED on chain to ${account.ethAddress} on ${MINT_DATE} (${MINT_TX_HASH})`,
    });
  });
}

(async function () {
  
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  const accountsJSON = JSON.parse((await fs.readFile('output/accounts.json')).toString());
  
  const AddressBook = (await (await fetch(address_book_file)).json());
  const AddressMap = _.keyBy(AddressBook, 'discordId');
  
  
  const ledger = Ledger.parse(ledgerJSON);
  const accounts = ledger.accounts();
  
  const discordAcc = accounts.map(a => {
    if (a.identity.subtype !== 'USER') return null;
    
    const discordAliases = a.identity.aliases.filter(alias => {
      const parts = NodeAddress.toParts(alias.address);
      return parts.indexOf('discord') > 0;
    });
    
    const ethAliases = a.identity.aliases.filter(alias => {
      const parts = NodeAddress.toParts(alias.address);
      return parts.indexOf('ethereum') > 0;
    });
    
    if (!discordAliases.length && !ethAliases.length) return null;
    
    let user = null;
    let discordId = null;
    let ethAddress = null;
    
    discordAliases.forEach(alias => {
      discordId = NodeAddress.toParts(alias.address)[4];
      if (AddressMap[discordId]) {
        user = AddressMap[discordId];
      }
    });
    
    ethAliases.forEach(alias => {
      ethAddress = NodeAddress.toParts(alias.address)[2];
      console.log({ ethAddress });
    });
    
    return {
      ...a,
      discordId,
      ethAddress: ethAddress || (user && user.address),
    };
  }).filter(Boolean);
  
  const discordAccWithAddress = discordAcc.filter(a => a.ethAddress);
  
  const depAccounts = DEPENDENCY_ACCOUNTS.map(dep => ({
    ...(ledger.account(dep.identity.id)),
    ...dep,
  }));
  
  deductSeedsAlreadyMinted([...discordAccWithAddress, ...depAccounts], ledger);
  await fs.writeFile(LEDGER_PATH, ledger.serialize())
  
  const newMintAmounts = {};
  let total = 0;
  discordAccWithAddress.forEach(acc => {
    const amountToMint = G.format(acc.balance, 9, '');
    newMintAmounts[acc.ethAddress] = amountToMint;
    if (!isValidAddress(acc.ethAddress)) {
      console.log('INVALID ADD for acc: ', acc);
    }
    
    total += parseFloat(amountToMint);
  });
  
  DEPENDENCY_ACCOUNTS.forEach(dep => {
    const acc = ledger.account(dep.identity.id);
    const amountToMint = G.format(acc.balance, 9, '');
    newMintAmounts[dep.ethAddress] = amountToMint;
    total += parseFloat(amountToMint);
  });
  
  // console.log(newMintAmounts.map(([address, amount]) => `${address},${numberToWei(amount)}`).join('\n'));
  // console.log({ total });
  
  // fs.writeFile('./scripts/toMint6Merkle.json', JSON.stringify(newMintAmounts));
})();
