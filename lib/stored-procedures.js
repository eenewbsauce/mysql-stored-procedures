const InitBase = require('sync-async-ctor');
const R = require('ramda');
const async = require('async');
const db = require('./mysql').db;
const anyargs = require('anyargs');
const fs = require('fs');
const underscore = require('underscore');

class StoredProcedures extends InitBase {
    constructor() {
        super(db.connect.bind(db));
    }

    static _deps() {
        return {
            modifyTemplate: modifyTemplate,
            sortInParams: sortInParams,
            mysql: db
        };
    }

    create(templatePath, templateLocals, cb) {
        let metadata = {
            templatePath: {
                type: 'string',
                required: true
            },
            templateLocals: {
                type: 'object',
                required: false
            },
            cb: {
                type: 'function',
                required: true
            }
        };

        let args = anyargs(arguments, metadata);

        async.parallel({
            init: this.init.bind(this),
            template: fs.readFile.bind(this, args.templatePath, 'utf8')
        }, (err, results) => {
            if (err) {
                this.error = err;

                return args.cb(err);
            }

            let sortedTemplate = modifyTemplate(results.template);

            let parsedTemplate = args.templateLocals
                ? underscore.template(sortedTemplate)(args.templateLocals)
                : sortedTemplate;

            db.query(parsedTemplate, (err, data) => {
              args.cb(err, data);
              db.end();
            });
        });
    }

    callWithParams(params, cb) {
        this.init(() => {
            if ((R.isNil(params.spName) || typeof params.spName !== 'string') ||
                (R.isNil(params.inParams)) || typeof params.inParams !== 'object') {
                return cb(new TypeError('StoredProcedures::callWithParams::Malformed params'));
            }

            let query = `
                CALL \`${params.database}\`.${params.spName}(${this._expandCallParams(params.inParams)})
            `;

            db.query(R.trim(query), (err, data) => {
              cb(err, data)
              db.end();
            });
        });
    }

    _expandCallParams(paramsObj) {
        return expand(paramsObj, (pair) => {
            return typeof pair[1] === 'string'
                ? `'${pair[1]}',`
                : `${pair[1]},`;
        });
    }
}

function modifyTemplate(template) {
    if (R.isNil(template)) return;

    return template.split('\n').map((line) => {
        if (line.indexOf('(IN ') >= 0) {
            return sortInParams(line);
        } else {
            return line;
        }
    }).join('\n');
}

function sortInParams(line) {
    let sorted = line
        .replace('(IN ', '')
        .replace(/\)$/, '')
        .split(',')
        .map((part) => (R.trim(part)))
        .sort(sortingFn);

    return `(IN ${sorted.join(', ')})`;
}

function expand(obj, mapFn) {
    return R.compose(
        (str) => (str.slice(0, -1)),
        R.join.bind(this, ' '),
        R.flatten,
        R.map.bind(this, mapFn),
        R.sort.bind(null, sortingFn),
        R.toPairs
    )(obj);
}

var sortingFn = (a, b) => {
    if (a < b) {
        return -1;
    } else if (b < a){
        return 1;
    } else {
        return 0;
    }
};

module.exports = StoredProcedures;
