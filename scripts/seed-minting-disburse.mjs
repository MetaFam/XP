#!/usr/bin/env node

import { sourcecred as sc } from 'sourcecred'
import fs from 'fs-extra'
// import { isValidAddress } from 'web3-utils'
import _ from 'lodash'
import yargs from 'yargs'

// ToDo: Replace with working implementation
const isValidAddress = (addr) => true

const processArgs = async (defaults = {
  txUrl: null,
  txDate: null,
  overwrite: false,
  ledger: 'data/ledger.json',
  outputPattern: 'distros/Disbursal #${index}.SourceCred',
  mainnetId: 'igdEDIOoos50r4YUKKRQxg',
  dryRun: false,
}) => {
  const args = yargs(process.argv.slice(2))
  .option('tx-url', {
    type: 'string',
    default: process.env.SC_TX_URL ?? defaults.txUrl,
    alias: 'u',
    description: (
      'URL for the disbursal transaction on the Polygonscan (`SC_TX_URL`)'
    ),
  })
  .option('tx-date', {
    type: 'string',
    default: process.env.SC_TX_DATE ?? defaults.txDate,
    alias: 'd',
    description: (
      'Date of the disbursal transaction (`SC_TX_DATE`)'
    ),
  })
  .option('ledger', {
    type: 'string',
    default: process.env.SC_LEDGER ?? defaults.ledger,
    alias: 'l',
    description: 'Path of `ledger.json` (`SC_LEDGER`)'
  })
  .option('overwrite', {
    type: 'boolean',
    default: process.env.SC_OVERWRITE ?? defaults.overwrite,
    alias: 'o',
    description: 'Overwrite the last disbursal (`SC_OVERWRITE`)'
  })
  .option('output-pattern', {
    type: 'string',
    default: (
      process.env.SC_DISBURSAL ?? defaults.outputPattern
    ),
    alias: 'p',
    description: 'Path to generate JSON to (`SC_DISBURSAL`)'
  })
  .option('mainnet-id', {
    type: 'string',
    default: process.env.SC_MAINNET_ID ?? 'igdEDIOoos50r4YUKKRQxg',
    alias: 'm',
    description: 'Something to do with the mainnet id (`SC_MAINNET_ID`)'
  })
  .option('dry-run', {
    type: 'boolean',
    default: false,
    alias: 'n',
    description: 'Don’t write anything to disk'
  })
  .alias('h', 'help')
  .help()
  .showHelpOnFail(true, 'HELP!')

  return args.argv
}
const argv = await processArgs()

if((argv.txUrl && !argv.txDate) || (!argv.txUrl && argv.txDate)) {
  console.error('Must provide `--tx-date` & `--tx-url` to write to ledger.')
  console.error(' Or neither to write CSV & JSON.')
  process.exit(13)
}

const overwrite = (
  argv.overwrite && argv.txUrl != null && argv.txDate != null
)

let index = 23 // index as of 2023/03/29
let base, prev
do {
  prev = base
  base = argv.outputPattern.replace(
    /\${index}/g, (index++).toString()
  )
} while(fs.existsSync(`${base}.json`))

const outputBase = overwrite ? prev : base

const Ledger = sc.ledger.ledger.Ledger
const G = sc.ledger.grain

const NodeAddress = sc.core.address.makeAddressModule({
  name: 'NodeAddress',
  nonce: 'N',
  otherNonces: new Map().set('E', 'EdgeAddress'),
})

async function deductSeedsAlreadyMinted({ accounts, ledger }) {
  const lastDisburse = JSON.parse((await fs.readFile(`${outputBase}.json`)).toString())

  let total = 0n

  Object.entries(lastDisburse).forEach(([address, amount]) => {
    const account = accounts.find(({ ethAddress: a }) => (
      a.toLowerCase() === address.toLowerCase()
    ))

    if(!account) {
      console.warn(`Missing account for: ${address}`)
      return
    }

    const disbursement = G.fromApproximateFloat(amount)
    const balance = G.fromString(account.balance)
    // console.debug({ seedsBalance, seedsMinted, mint })
    // console.debug({ address, amount, seedsMinted })

    let transfer = disbursement
    // Only transfer up to max balance
    if(G.lt(balance, disbursement)) {
      console.warn(
        `Extra SEED Balance for: ${account.ethAddress}:`
        + ` -${G.sub(disbursement, balance)}`
      )
      transfer = balance
    }

    if(transfer > 0) {
      ledger.transferGrain({
        from: account.identity.id,
        to: argv.mainnetId,
        amount: transfer,
        memo: (
          `Disbursed SEED on Polygon to ${account.ethAddress}`
          + ` on ${argv.txDate} (${argv.txUrl})`
        ),
      })
      total += BigInt(transfer)
    }
  })
  console.info({ 'total disbursed': total })
}

(async () => {
  const ledgerJSON = (await fs.readFile(argv.ledger)).toString()

  const ledger = Ledger.parse(ledgerJSON)
  const accounts = ledger.accounts()

  const accountsWithAddress = accounts.map((a) => {
    if(a.identity.subtype === 'BOT') return null
    if(!a.active) return null

    const ethAliases = a.identity.aliases.filter(
      (alias) => {
        const parts = NodeAddress.toParts(alias.address)
        return parts.includes('ethereum')
      }
    )

    if(ethAliases.length === 0) return null

    let ethAddress = null

    ethAliases.forEach((alias) => {
      ethAddress = NodeAddress.toParts(alias.address)[2]
    })

    return { ...a, ethAddress }
  }).filter(Boolean)

  if(overwrite) {
    await deductSeedsAlreadyMinted({
      accounts: [...accountsWithAddress],
      ledger,
    })
    console.info(`Writing ledger to: ${argv.ledger}.`)
    if(argv.dryRun) {
      console.info('𝙳𝚛𝚢 𝚁𝚞𝚗: Not writing ledger.')
    } else {
      await fs.writeFile(argv.ledger, ledger.serialize())
    }
  }

  const addressAccounts = (
    _.keyBy(accountsWithAddress, 'ethAddress')
  )
  const newMintAmounts = {}
  let total = 0
  accountsWithAddress.forEach((acc) => {
    const amountToMint = Number(G.format(acc.balance, 9, ''))

    // ignore players with zero to mint. They just get removed from the csv later anyway.
    if(amountToMint <= 0) return

    newMintAmounts[acc.ethAddress] = amountToMint
   
    if(!isValidAddress(acc.ethAddress)) {
      console.warn(`INVALID ADDR for acct: ${acc}`)
    }

    total += amountToMint
  })

  const csv = (
    Object.entries(newMintAmounts).map(([address, amount]) => {
      const acc = addressAccounts[address]
      return [acc?.identity?.name, address, amount].join(',')
    }).join('\n')
  )

  console.info(`Writing disbursal to: ${outputBase}.csv.`)
  if(argv.dryRun) {
    console.info('𝙳𝚛𝚢 𝚁𝚞𝚗: Not writing disbursal.')
  } else {
    await fs.writeFile(`${outputBase}.csv`, csv)
  }

  console.info({ total })

  console.info(`Writing disbursal to: ${outputBase}.json.`)
  if(argv.dryRun) {
    console.info('𝙳𝚛𝚢 𝚁𝚞𝚗: Not writing disbursal.')
  } else {
    await fs.writeFile(
      `${outputBase}.json`,
      JSON.stringify(newMintAmounts, null, 2),
    )
  }
})()
