
# How to do SEED Distributions

## A. Calculating distribution + updating ledger
1. Fork/clone the repo locally and follow the instructions in the main readme to load the SourceCred instance (you will need API keys for Github and Discord)
2. If you already forked the repo, make sure to pull any changes from the master branch (since the discord bot updates ETH addresses in the ledger programmatically)
3. Due to painfully long and unreliable method of loading contribution data locally using `yarn load`, we now use the following method from within the root of the XP repo, [as advised by SC](https://discord.com/channels/453243919774253079/718263631158050896/778428725570174986):
    1. On `master`, fetch the latest updates from origin: `git pull`.
    2. Checkout the `output` directory of the `gh-pages` branch: `git checkout origin/gh-pages -- output` — *(the graph data from the last run)*.
    3. Run `yarn serve` to fire up the interface from [xp.metagame.wtf](https://xp.metagame.wtf/#/) with the latest data.
4. Open the admin interface at [`localhost:6006`](http://localhost:6006) and go to the “Identities” tab. To merge accounts:
    1. Search in 'Filter List' for the accounts to be merged.
    2. For each user, use the “Add Alias” field to search for their aliases.
    3. Click on all the accounts needing to be merged into the selected user.
    4. Repeat the process for any other users.
    5. Once you are done, click “Save ledger to disk”.
    6. Exit the running SC instance *(`CTRL+C` in terminal)*.
5. *If you do need to activate players, you will want to commit the ledger, push changes and create a PR before progressing with Step 6, otherwise skip the rest of this step.* Create a new branch along the lines of `git checkout -b activations/year-month-day`, commit changes to `ledger.json`, push, and open a PR. Once merged, we need to wait overnight for the runners to run again with the newly activated or merged players.
> ❢ If you activated players, confirm the GitHub actions have run  (sometimes they fail) since your PR was merged. You will need to repeat Step 3 again to get the latest data before moving to Step 7 .
6. Check [this Observable notebook](https://observablehq.com/@hammadj/metagame-active-contributors) to see how many `seedsToMintForCurrentInterval`. This is based on 20 SEEDs per week per active contributor *(where “active” players earned at least 20 XP)*.
7. Update the `config/grain.json` file with ~75% of the `seedsToMint` amount going to `RECENT` policy and ~25% going to the `BALANCED` policy (e.g. if the number in Observable is 400, put 300 in Recent and 100 in Balanced).
8. Check the leaderboard in the UI to ensure the XP amounts for the distribution period make sense.
9. In a new terminal window, run `yarn grain` to do the distribution.
10. Refresh the admin page and go to the SEED Accounts page to see the new SEED balance for each player, ensure these amounts make sense.
11. Create a new branch at this point and name it something sane like `git checkout -b dist/day-month–day-month-year`.
12. In the `scripts/seed-minting-disburse.js` file, change the filename in `MINT_AMOUNTS_PATH` to be 1 higher than the highest existing filename *(e.g. if `toMint18Disburse.json` is the latest file in the scripts folder, change the path to `./scripts/toMint19Disburse.json`)*.
13. Run `node scripts/seed-minting-disburse.js > 'output/Disburse #24.SourceCred Distribution.csv'` in a terminal to generate the JSON & CSV files of ETH addresses and SEED amounts to disburse.
14. Keep track of the total amount of SEEDs to mint as output by the script in the previous step. This value will be used later when verifying data for deducting from the ledger in Step C.
15. Post the distribution to the community *(posted to #seed-minting)* using [this Google Sheet](https://docs.google.com/spreadsheets/d/1m8XGjFnTpozt5BBlCZgHen09msimS3HHIT2Sb5Shuro/edit?usp=sharing) *(ask @luxumbra for edit access)*. Refer to previous sheets for formatting convention. Make sure any issues with the distribution raised by the community have been addressed. We usually give 72 hours to raise issues. If you need to re-run a distribution, `git checkout ledger.json` before running `yarn grain` again.
16. Once discussion has concluded, commit and push all changes to Github, and make a PR to merge them into `master`.
> ⚠️ If there are merge conflicts, you may need to run `scripts/rebase-ledger.js`.

## B. Airdrop Distribution
> ⚠️ *This step requires you to be a signer on the [Polygon multisig](https://gnosis-safe.io/app/matic:0xbaF60086Da36033B458B892e2432958e219F4Ed6).*

1. Reformat the final [Google Sheet](https://docs.google.com/spreadsheets/d/1m8XGjFnTpozt5BBlCZgHen09msimS3HHIT2Sb5Shuro/) to match the same headings & columns as seen in `output/toMint18DisburseAirdrop.csv`. **Note the addition of the leading  `token_type` (`erc20`) and `token_address` (`0xEAeCC18198a475c921B24b8A6c1C1f0f5F3F7EA0`) columns**. *This file is to upload to the Airdrop app in Gnosis.*
2. Go to [the gnosis safe](https://gnosis-safe.io/app/matic:0xbaF60086Da36033B458B892e2432958e219F4Ed6) and sign in. Head to Apps → CSV Airdrop and upload the `.csv` file from the previous step. Next, you should see the contents of the file in the textfield.
3. Verify the data looks good, submit, and sign the transaction.
4. Once the transaction is confirmed, grab the transaction URL, and post it in #multisig, pestering the signers until it's done.
5. Relax… until the drop is done and you then need to move to step C — as soon as possible post distribution (after your distro branch has been merged) to avoid any ledger conflicts!

## C. Deducting minted SEEDs from ledger

1. Pull down the latest changes from origin (with data from the latest dist)
2. Create a new branch from master and give it a sensible name eg: `dist/20_deduct-seed-from-ledger`
3. Rerun `scripts/seed-minting-disburse.js` with the following arguments:
   1. Set `MINT_TX_HASH` to the etherscan link for the `seedAllocations` transaction from step A.10 above.
   2. Set `MINT_DATE` to the date of the said transaction
   3. Uncomment the lines that call `deductSeedsAlreadyMinted` (currently line 88 and 89).
4. Run `node ./scripts/seed-minting-disburse.js` again and ensure there's no major errors or large "Extra SEED Balance" messages logged.
5. Ensure that the `toMintXDisburse.json` file for the current distribution did not have any changes. This ensures that the on chain distribution exactly matches the ledger state.
6. Run `yarn serve`, and double check that the current balance in SEED Accounts is 0 for people in the distribution.
7. Commit the updates to `ledger.json`, push them, and make a new PR to `master`.
