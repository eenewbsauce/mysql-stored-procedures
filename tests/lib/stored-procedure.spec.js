var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var path = require('path');
const fs = require('fs');
var sbItems = {};

var StoredProcedures = require('../../').StoredProcedures;

const deps = StoredProcedures._deps();
const mysql = deps.mysql;
const templatePath = path.join(__dirname, '/mocks/stored-procedure.sql');
const templateMock = fs.readFileSync(templatePath, 'utf-8');
const templateUnderscoreMock = path.join(__dirname, '/mocks/stored-procedure-underscore.sql');
const sortedTemplateMock = fs.readFileSync(path.join(__dirname, '/mocks/stored-procedure-sorted.sql'), 'utf-8');
const inParamsFromTemplate = templateMock.split('\n')[1];
let sps;

describe.only('database :: storedProcedures :: unit ::', function () {
    beforeEach(function(done) {
        sbItems.mysqlQuery = sandbox.stub(mysql, 'query').callsArgWithAsync(1, null);
        sbItems.spMysqlConnect = sandbox.stub(mysql, 'connect').callsArgWithAsync(0, null);
        sps = new StoredProcedures();
        sbItems.spInit = sandbox.spy(sps, 'init');
        sbItems.spFlushInitQueue = sandbox.spy(sps, '_flushInitQueue');
        sbItems.addToInitQueue = sandbox.spy(sps, '_addToInitQueue');

        done();
    });

    describe('create ::', function() {
        it('should create the stored procedure', function(done) {
            sps.create(templatePath, function(err, results) {
                assert(!err);
                assert(!sps.error);
                assert(sps._initialized);
                assert(!sps._initializing);
                assert(sbItems.spInit.called);
                assert(sbItems.spFlushInitQueue.called);
                assert(sbItems.spMysqlConnect.calledOnce);

                done();
            });
        });

        it('should create the stored procedure with underscore templates', function(done) {
            sps.create(templateUnderscoreMock,
                { environment: 'dev-rtracey' },
                function(err, results) {
                    assert(!err);
                    assert(!sps.error);
                    assert(sps._initialized);
                    assert(!sps._initializing);
                    assert(sbItems.spInit.called);
                    assert(sbItems.spFlushInitQueue.called);
                    assert(sbItems.spMysqlConnect.calledOnce);

                    done();
                });
        });

        it('should throw if bad arguments are passed', function() {
            try {
                sps.create()
            } catch (err) {
                expect(err.message).to.equal('helper::arguments::decipherArguments:: missing required parameter in args');
                assert(err);
            }
        });
    });

    describe('callWithParams ::', function() {
        it('should form query and run connectAndExec', function(done) {
            sps.callWithParams({
                spName: 'tester',
                inParams: {
                    foo: 'bar'
                }
            }, () => {
                assert(sbItems.mysqlQuery.calledOnce);

                done();
            });
        });

        it('should callback with error is params are invalid', function(done) {
            sps.callWithParams({
                spName: 'tester'
            }, (err) => {
                assert(err);
                assert(sbItems.mysqlQuery.notCalled);

                done();
            });
        });
    });

    describe('_expandCallParams ::', function() {
        it('should create a comma seperated list from params', function() {
            let p = sps._expandCallParams({foo: 'bar', baz: 'buzz', a: 5});

            expect(p).to.equal("5, 'buzz', 'bar'");
        });
    });

    describe('deps ::', function() {
        describe('sortInParams', function() {
            it('should sort the params in alphabetical order', function() {
                let sortedInParams = deps.sortInParams(inParamsFromTemplate);

                expect(sortedInParams).to.equal('(IN age int, clientId int, limit int, offset int, ryan bit, status varchar(20))');
            });
        });

        describe('modifyTemplate', function() {
            it('should sort the params in alphabetical order and save to template', function() {
                let sortedTemplate = deps.modifyTemplate(templateMock);

                expect(sortedTemplate).to.equal(sortedTemplateMock);
            });

        });
    });

    afterEach(function () {
        sandbox.restore();
    });
});
