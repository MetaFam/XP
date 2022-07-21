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

const MINT_TX_HASH = "https://polygonscan.com/tx/0xc67d316e622245603ebfaec12794e86d88016e25f367ae22366c4c5e4494d371";
const MINT_DATE = "May 19 2022";

const LEDGER_PATH = 'data/ledger.json';
const MINT_AMOUNTS_PATH = './scripts/toMint18Disburse.json';
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
    if (seedsBalance > 0) {
      //ledger.activate(account.identity.id);
      ledger.transferGrain({
        from: account.identity.id,
        to: ETH_MAIN_NET_IDENTITY_ID,
        amount: transferAmount,
        memo: `Minted SEED on chain to ${account.ethAddress} on ${MINT_DATE} (${MINT_TX_HASH})`,
      });
    }
  }
}

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

  // await deductSeedsAlreadyMinted([...accountsWithAddress], ledger);
  await fs.writeFile(LEDGER_PATH, ledger.serialize());

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
