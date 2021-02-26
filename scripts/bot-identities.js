const sc = require('sourcecred');
const fs = require("fs-extra")

console.log(sc);


const Ledger = sc.sourcecred.ledger.ledger.Ledger;

const LEDGER_PATH = 'data/ledger.json';

const BOT_IDENTITY_IDS = ["o8D4XfeegC4KWBVCA90DcQ", "F6faFVJPXAMeZl5uaaPYMA"];

(async function() {
  
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  const ledger = Ledger.parse(ledgerJSON);
  
  BOT_IDENTITY_IDS.forEach(id => {
    ledger.changeIdentityType(id, "BOT")
  })
  
  await fs.writeFile(LEDGER_PATH, ledger.serialize())
  
})()
