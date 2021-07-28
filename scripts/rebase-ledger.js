require('dotenv').config()
const sc = require('sourcecred').sourcecred;
const fs = require("fs-extra");

const Ledger = sc.ledger.ledger.Ledger;

const storage = new sc.ledger.storage.GithubStorage({
  apiToken: process.env.SOURCECRED_GITHUB_TOKEN,
  repo: 'MetaFam/XP',
  branch: 'master',
});


const LEDGER_PATH = 'data/ledger.json';

(async function () {
  const ledgerJSON = (await fs.readFile(LEDGER_PATH)).toString();
  
  const ledger = Ledger.parse(ledgerJSON);
  const ledgerLog = ledger.eventLog();
  
  const manager = new sc.ledger.manager.LedgerManager(
    {
      storage,
      initLogs: ledgerLog
    },
  );
  
  const res = await manager.reloadLedger();
  
  console.log(res);
  
  
  await fs.writeFile(LEDGER_PATH, manager.ledger.serialize())
})();
