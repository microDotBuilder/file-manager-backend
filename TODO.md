## features TODO

## step 1

- [ ] setup convex
- [ ] store plain json file in the database
- [ ] generate tree from the json file
- [ ] generate diff tree from the json file
- [ ] return the diff tree to the frontend
- [ ] backend endpoint to receive the json file for update
- [ ] backend endpoint to receive the json file for setup
- [ ] after the update is received, create the diff tree and store diff tree and the json tree as last update in the database
- [ ] datamodel to have two type of trees last update tree and diff tree.
- [ ] implement cashing model. @not important

## step 2

- [ ] request the data from the frontend based on the diff tree ( CRON JOB and polling)
  - [ ] idea is to somehow request files from the frontend based on the diff tree

## step 3

- [ ] check in big files if there is only small changes on frontend like github using longest common subsequesnce -[ ] if yes then send the file and the subsequence to the backend
- [ ] backend will figureout how to update the files on google drive
