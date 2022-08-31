# How to do SEED Distributions

## A. Calculating distribution + updating ledger
1. Fork the repo locally and follow the instructions in the main readme to load the SourceCred instance (you will need API keys for Github and Discord)
2. If you already forked the repo, make sure to pull any changes from the master branch (since the discord bot updates ETH addresses in the ledger programmatically)
3. Due to painfully long and unreliable method of loading contribution data locally using `yarn load`, we now use the following method from within the root of the XP repo, [as advised by SC](https://discord.com/channels/453243919774253079/718263631158050896/778428725570174986):
    1. Fetch the latest updates from origin and checkout the `gh-pages` branch:  `git fetch && git checkout origin/gh-pages`
    2. Remove the output directory from tmp (if it exists from a prev mint): `rm -rf /tmp/sc-output`
    3. Copy the `output` directory (this is what is on [xp.metagame.wtf](https://xp.metagame.wtf/#/) with the graph data from the last run) to a temp directory: `cp -r output /tmp/sc-output`
    4. `git checkout origin/master` and delete the output directory `rm -rf output`
    5. Move the `sc-output` directory from `tmp` to this branch `mv /tmp/sc-output output`
    6. Run `yarn site` to fire up the explorer on your local machine with the latest data from production.
4. Check [this Observable notebook](https://observablehq.com/@hammadj/metagame-active-contributors) to see how many `seedsToMintForCurrentInterval`. This is based on 20 SEEDs per week per active contributor (players that earned at least 20 XP)
5. Update the config/grain.json file with ~75% of the amount going to RECENT policy and ~25% going to the BALANCED policy (e.g. if the number in Observable is 400, put 300 in Recent and 100 in Balanced)
6. Run `yarn start` to run SC. Then, `git commit` the updated ledger file which contains new identities / users from the data loaded.
7. Open the admin interface at `localhost:6006` in your browser and go to the "Identities" tab. Search for any users that need their accounts to be merged across platforms.
8. Then, in the "Add Alias" field search and click on all the accounts to merge into the selected user. Once you are done, click "Save ledger to disk" to persist the changes.
9. Exit the running SC instance (CTRL+C in terminal) and run `yarn start` again to recalculate XP scores based on the merged accounts.
10. Check the leaderboard in the UI to ensure the XP amounts for the distribution period make sense.
11. In a new terminal window, run `yarn grain` to do the distribution.
12. Refresh the admin page and go to the SEED Accounts page to see the new SEED balance for each player, ensure these amounts make sense.
13. In the `scripts/seed-minting-disburse.js` file, change the filename in `MINT_AMOUNTS_PATH` to be 1 higher than the highest existing filename (e.g. if `toMint18Disburse.json` is the latest file in the scripts folder, change the path to `./scripts/toMint19Disburse.json`)
> ℹ️ At this point, *make sure to check lines 88 & 89 in `seed-minting-disburse.js` and comment out the lines that call `deductSeedsAlreadyMinted`, if they aren't already*.
14. Run `node ./scripts/seed-minting-disburse.js` in a terminal to generate the JSON file of ETH addresses and SEED amounts to mint for the current distribution.
15. Write down / keep track of the total amount of SEEDs to mint as output by the script in the previous step. This value will be used later when verifying data for deducting from the ledger in Step C.
16. Now you'll want to post the distribution to the community (posted to #seed-minting) using [this Google Sheet](https://docs.google.com/spreadsheets/d/1m8XGjFnTpozt5BBlCZgHen09msimS3HHIT2Sb5Shuro/edit?usp=sharing) (ask @luxumbra for edit access). Make sure any issues with the distribution raised by the community have been addressed. We usually give 48 hours to raise issues with a dist. If you need to re-run a distribution, delete the new entries in ledger.json that start with `{"action":{"distribution"` before running `yarn grain` again.
17. Once any/all issues are resolved, put the Mint up for vote in #voting (Discord) linking to the Google Sheet for reference.
18. Once the vote has passed, commit and push all changes to Github and make a PR to merge them into master.
> ⚠️ *You should make sure there have been no new changes to master since you first started doing the distribution otherwise there will be merge conflicts*. If there are merge conflicts, you may need to run the `rebase-ledger.js` script.

## B. Airdrop Distribution
> ⚠️ *This step requires you to be a signer on the [Polygon multisig](https://gnosis-safe.io/app/matic:0xbaF60086Da36033B458B892e2432958e219F4Ed6).*

1. Reformat the final [Google Sheet](https://docs.google.com/spreadsheets/d/1m8XGjFnTpozt5BBlCZgHen09msimS3HHIT2Sb5Shuro/edit?usp=sharing) to match the same headings & columns as seen in `scripts/toMint18DisburseAirdrop.csv`. **Note the addition of `token_type` and `token_address` columns**. *You'll need this file to upload to the Airdrop app in Gnosis.*
2. Go to [the gnosis safe](https://gnosis-safe.io/app/matic:0xbaF60086Da36033B458B892e2432958e219F4Ed6) and sign in with your registered wallet. And head to Apps > CSV Airdrop and upload the `.csv` file from the previous step. All going well, there wont be any errors and you should see the contents of the file in the textfield.
3. Verify the data looks good and clean up any extraneous lines (sometimes the CSV file has extra lines at the end). When you're happy, submit and sign the transaction.
4. Once the transaction is confirmed, grab the transaction URL from the page and post it in #multisig, rememering to pester the signers until it is done. (actually, they don't take too much pestering these days 😅)
5. Relax...until the drop is done and you then need to move to step C - soon after or at latest, before the next mint!


## C. Deducting minted SEEDs from ledger

1. In the XP repo, make the following changes to the `scripts/seed-minting-disburse.js` file:
   1. set `MINT_TX_HASH` to the etherscan link for the `seedAllocations` transaction from step C.10 above.
   2. set `MINT_DATE` to the date of the said transaction
   3. Uncomment the lines that call `deductSeedsAlreadyMinted` (currently line 88 and 89).
2. Run `node ./scripts/seed-minting-disburse.js` again and ensure there's no major errors or large "Extra SEED Balance" messages logged.
3. Ensure that the `toMintXDisburse.json` file for the current distribution did not have any changes. This ensures that the on chain distribution exactly matches the ledger state.
4. Run `yarn serve` and double check that the current balance in SEED Accounts is 0 for people in the distribution.
5. Commit the updates to `ledger.json` and push them to master with a PR.
