# mysql-stored-procedures

## Installation

First you need to export the database credentials as environment variables

```
export MYSQL_HOST=localhost
export MYSQL_USER=eenewbsauce
export MYSQL_PASSWORD=secret
```

then install the module

`npm i mysql-stored-procedures`

## Usage

Creating Stored Procedures

```javascript
const StoredProcedures = require('mysql-stored-procedures');
const sps = new StoredProcedures();

sps.create({

}, (err) => {

})
```

Calling Stored Procedures

```javascript
const StoredProcedures = require('mysql-stored-procedures');
const sps = new StoredProcedures();

sps.callWithParams({

}, (err, data) => {

})
```

## TODO

Add support for `OUT` values
