const sc = require('sourcecred').sourcecred;
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
// Sixth Distribution (Merkle):
//      TX: https://etherscan.io/tx/0xe4920d3d452e2bb386f5155a783a82c585404dc5fb40d182a65ec2bac20d0470
//      Merkle Root: https://storageapi.fleek.co/hammadj-team-bucket/seed-claim/seedMerkle2.json
// Seventh Distribution (Merkle):
//      TX: https://etherscan.io/tx/0x7b0c59e53e9362f232a78fe7ca6192950777e87a725dcf2b272de13d8061fc8a
//      Merkle Root: https://storageapi.fleek.co/hammadj-team-bucket/seed-claim/seedMerkle3.json
// Eighth Distribution (Merkle):
//      TX: https://etherscan.io/tx/0xa83db2454404f2f11035abefa129c71c4dc9f078a2a28a69af2355f2a8139159
//      Merkle Root: https://storageapi.fleek.co/hammadj-team-bucket/seed-claim/seedMerkle4.json
// Ninth Distribution (Merkle):
//      TX: https://etherscan.io/tx/0x07a2eb5e57a09f7228cc610c5dc2f102c1f7451007a625b8c366c6603cd4c31e
//      Merkle Root: https://storageapi.fleek.co/hammadj-team-bucket/seed-claim/seedMerkle5.json



const MINT_TX_HASH = "https://etherscan.io/tx/0x07a2eb5e57a09f7228cc610c5dc2f102c1f7451007a625b8c366c6603cd4c31e";
const MINT_DATE = "Aug 26 2021";

const LEDGER_PATH = 'data/ledger.json';
const MINT_AMOUNTS_PATH = './scripts/toMint9Merkle.json';
const ETH_MAIN_NET_IDENTITY_ID = "igdEDIOoos50r4YUKKRQxg";

async function deductSeedsAlreadyMinted(accounts, ledger) {
  const LAST_MINTING =  JSON.parse(await fs.readFile(MINT_AMOUNTS_PATH));
  
  for (const address in LAST_MINTING) {
    
    const amount = LAST_MINTING[address];
  
    const account = accounts.find(a => a.ethAddress.toLowerCase() === address.toLowerCase());
    if (!account) {
      console.warn('Missing account for: ', address);
    }

    const seedsMinted = G.fromApproximateFloat(amount);
    const seedsBalance = G.fromString(account.balance);
    // console.log({ seedsBalance, seedsMinted, mint });
    // console.log({ address, amount, seedsMinted });
  
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
  }
}

(async function () {
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  
  const ledger = Ledger.parse(ledgerJSON);
  const accounts = ledger.accounts();
  
  const accountsWithAddress = accounts.map(a => {
    if (a.identity.subtype === 'BOT') return null;
    
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

  // Uncomment these two lines below and rerun script after distribution is on chain and MINT_TX_HASH + MINT_DATE is updated.
  // await deductSeedsAlreadyMinted([...accountsWithAddress], ledger);
  // await fs.writeFile(LEDGER_PATH, ledger.serialize())
  
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
