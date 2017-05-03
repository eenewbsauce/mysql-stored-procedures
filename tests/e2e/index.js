const StoredProcedures = require('../../').StoredProcedures;
const path = require('path');
const expect = require('chai').expect;

let sps = new StoredProcedures();

sps.create(path.join(__dirname, '../lib/mocks/e2e.sql'), (err) => {
  if (err) {
    console.log(err)
  }

  sps.callWithParams({
    spName: 'e2e_sproc',
    database: 'testing',
    inParams: {
      likeVal: 'help'
    }
  }, (err, data) => {
    if (err) {
      console.log(err)
    }

    expect(data[0].length).to.equal(4);

    console.log('e2e passed!');
  })
});
