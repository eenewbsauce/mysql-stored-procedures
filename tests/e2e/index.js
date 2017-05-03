const StoredProcedures = require('../../').StoredProcedures;
const path = require('path');

let sps = new StoredProcedures();

sps.create(path.join(__dirname, '../lib/mocks/e2e.sql'), (err) => {
  if (err) {
    console.log(err)
  }
});
