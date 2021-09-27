# How to do SEED Distributions

## A. Calculating distribution + updating ledger
1. Fork the repo locally and follow the instructions in the main readme to load the SourceCred instance (you will need API keys for Github and Discord)
2. If you already forked the repo, make sure to pull any changes from the master branch (since the discord bot updates ETH addresses in the ledger programmatically)
3. Run `yarn load` to load the latest contribution data.
4. Check [this Observable notebook](https://observablehq.com/@hammadj/metagame-active-contributors) to see how many `seedsToMintForCurrentInterval`. This is based on 20 SEEDs per week per active contributor (players that earned at least 20 XP)
5. Update the config/grain.json file with ~75% of the amount going to RECENT policy and ~25% going to the BALANCED policy (e.g. if the number in Observable is 400, put 300 in Recent and 100 in Balanced)
6. Run `yarn start` to run SC. Then, `git commit` the updated ledger file which contains new identities / users from the data loaded.
7. Open the admin interface at `localhost:6006` in your browser and go to the "Identities" tab. Search for any users that need their accounts to be merged across platforms.
8. Then, in the "Add Alias" field search and click on all the accounts to merge into the selected user. Once you are done, click "Save ledger to disk" to persist the changes.
9. Exit the running SC instance (CTRL+C in terminal) and run `yarn start` again to recalculate XP scores based on the merged accounts.
10. Check the leaderboard in the UI to ensure the XP amounts for the distribution period make sense.
11. In a new terminal window, run `yarn grain` to do the distribution.
12. Refresh the admin page and go to the SEED Accounts page to see the new SEED balance for each player, ensure these amounts make sense and any issues with the distribution raised by the community have been addressed. If you need to re-run a distribution, delete the new entries in ledger.json that start with `{"action":{"distribution"` before running `yarn grain` again.
13. In the `scripts/seed-minting.js` file, change the filename in `MINT_AMOUNTS_PATH` to be 1 higher than the highest existing filename (e.g. if `toMint9Merkle.json` is the latest file in the scripts folder, change the path to `./scripts/toMint10Merkle.json`)
14. Run `node ./scripts/seed-minting.js` in a terminal to generate the JSON file of ETH addresses and SEED amounts to mint for the current distribution.
15. Write down / keep track of the total amount of SEEDs to mint as outputted by the script in the previous step. This value will be used to do the merkle distribution.
16. Commit and push all changes to Github and make a PR to merge them into master. You should make sure there have been no new changes to master since you first started doing the distribution otherwise there will be merge conflicts. If there are merge conflicts, you may need to run the `rebase-ledger.js` script.
17. Make a proposal in the [Aragon DAO](https://client.aragon.org/#/metafam/0x3066195dc63c4b8c8e1dc4e1aba031d7f36e933c/) to mint the number of SEEDs from step 15 to the MetaFam Multisig address (`0x3455FbB4D34C6b47999B66c83aA7BD8FDDade638`)

## B. Calculating Merkle Root
1. Clone the [Merkle distribution repo](https://github.com/MetaFam/erc20-redeemable) and run `yarn`
2. `cd merkle` to go into the merkle folder and run `yarn` again.
3. Copy the `.env.example` file to a `.env` file and update the LIVE_NETWORK value with an Infura key (create one if you dont have one)
4. Copy the `toMintXMerkle.json` file from the steps above into the `merkle/test/data` folder and name it `seedMerkleX.json` where X is one higher than the last file already there.
5. Run `yarn disburse ./test/data/seedMerkleX.json <blocknum> --network live`. Replace `<blocknum>` with the [latest blocknumber ](https://etherscan.io/blocks), e.g. `13306106`.
6. The script will output the merkle root hash in the last line: `await redeem.seedAllocations(weekNum, "<merkle root hash>")`. Copy / save that hash as you will need it when calling the merkle contract.

## C. Executing the Merkle distribution

1. Ensure that the vote to mint SEEDs to the multisig has passed and enacted (from step A.17 above) 
2. Open the "Write Contract" page for the [merkle contract on etherscan](https://etherscan.io/address/0x3bf5c0a496E95Be000C724Bc580343Ff2DB346CB#writeContract) and click "Connect to Web3"
3. Select WalletConnect and click "copy to clipboard"
4. Open the "Apps" page in the [MetaFam Gnosis Safe](https://gnosis-safe.io/app/#/safes/0x3455FbB4D34C6b47999B66c83aA7BD8FDDade638/apps) and click on WalletConnect. Paste the copied code from your clipboard to connect Gnosis to Etherscan (you might have to click "Connect to Web3" again in Etherscan before it connects).
5. Open the `seedAllocation` method and fill out the values
   1. set `_week` to the same number as X in `seedMerkleX.json`. e.g. seedMerkle6.json -> use `6`
   2. set `_merkleRoot` to the value copied in step 6
   3. paste in the total amount from step A.15 above. Then click the "+" button beside the field name and add 10^18 zeroes.
6. Click the "Write" button and go to the Gnosis Safe tab to Submit the transaction.
7. Get the multisig signers to approve and execute the transaction. 
8. While you are waiting for that, upload the `seedMerkleX.json` file to the [Fleek storage space](https://app.fleek.co/). Click on the file in Fleek and copy the "Current IPFS Hash".
9. Add a new entry to the `test/data/snapshot.json` file with the next number as the key and the IPFS hash you copied as the value.
10. Once the `seedAllocations` transaction has executed, upload the `snapshot.json` to the Fleek storage.
11. The distribution should now be claimable. Test out if it works by going to [claim.metagame.wtf](https://claim.metagame.wtf). You might need to force refresh the page if the latest distribution doesnt show up right away (SHIFT + click refresh).
12. Commit and push these changes to master.

## D. Deducting minted SEEDs from ledger

1. In the XP repo, make the following changes to the `scripts/seed-minting.js` file:
   i. set `MINT_TX_HASH` to the etherscan link for the `seedAllocations` transaction from step C.10 above.
   ii. set `MINT_DATE` to the date of the said transaction
   iii. Uncomment the lines that call `deductSeedsAlreadyMinted` (currently lines 116 and 117).
2. Run `node ./scripts/seed-minting.js` again and ensure there's no major errors or large "Extra SEED Balance" messages logged.
3. Ensure that the `toMintXMerkle.json` file for the current distribution did not have any changes. This ensures that the on chain distribution exactly matches the ledger state.
4. Run `yarn serve` and double check that the current balance in SEED Accounts is 0 for people in the distribution. 
5. Commit the updates to `ledger.json` and push them to master with a PR.
