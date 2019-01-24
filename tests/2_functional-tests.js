/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http'),
      chai = require('chai'),
      assert = chai.assert;

const server = require('../server'),
      StockModel = require('../models/Stock');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.beforeAll((done) => {
      StockModel.deleteMany({}, (err) => {
        assert.ifError(err);
        console.log('Deleted all current items in database.')
        console.log('Now starting suite tests....')
        done();
      });
    })
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', (done) => {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response must have a stockData');
            assert.property(res.body.stockData, 'symbol', 'stockData must have a symbol property');
            assert.strictEqual(res.body.stockData.symbol, 'goog', "for ?stock=goog input query, return stockData.stock must be 'goog'");
            assert.property( res.body.stockData, 'price', 'stockData must have price property');
            assert.isNumber(res.body.stockData.price,'stockData.price must be in Number format');
            assert.property(res.body.stockData, 'likes', 'stockData must have likes property' );
            assert.isNumber( res.body.stockData.likes, 'stockData.likes must be a number' );
            done();
          });
      });
      
      // .query({stock: 'goog', like: 'true'})
      test('1 stock with like', (done) => {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog', like: 'true' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response must have a stockData');
            assert.property(res.body.stockData, 'symbol', 'stockData must have a symbol property');
            assert.strictEqual(res.body.stockData.symbol, 'goog', "for ?stock=goog input query, return stockData.symbol must be 'goog'");
            assert.property( res.body.stockData, 'price', 'stockData must have price property');
            assert.isNumber(res.body.stockData.price,'stockData.price must be in Number format');
            assert.property(res.body.stockData, 'likes', 'stockData must have likes property' );
            assert.isNumber( res.body.stockData.likes, 'stockData.likes must be in Number format');
            done();
          });
      });
      
      // .query({stock: 'goog', like: 'true'})
      test('1 stock with like again (ensure likes arent double counted)', (done) => {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog', like: 'true' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response must have a body');
            assert.property(res.body.stockData, 'symbol', 'stockData must have a symbol property');
            assert.strictEqual(res.body.stockData.symbol, 'goog', "for ?stock=goog input query, return stockData.symbol must be 'goog'");
            assert.property( res.body.stockData, 'price', 'stockData must have price property');
            assert.isNumber(res.body.stockData.price,'stockData.price must be in Number format');
            assert.property(res.body.stockData, 'likes', 'stockData must have likes property' );
            assert.isNumber( res.body.stockData.likes, 'stockData.likes must be in Number format' );
            assert.strictEqual(res.body.stockData.likes, 1, 'stockData.likes can be updated once per unique IP');
            done();
          });
      });
      
      // .query({stock: ['goog', 'msft']})
      test('2 stocks', (done) => {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft']})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response must have a stockData');
            assert.isArray(res.body.stockData, 'stockData must be an array');
            for(let item of res.body.stockData) {
              assert.property(item, 'symbol', 'each item in stockData needs a symbol');
              assert.isString(item.symbol, 'item.symbol must be in string format');
              assert.property(item, 'price', 'items must have price property');
              assert.isNumber(item.price, 'item.price must be in Number format');
              assert.property(item, 'rel_likes', "items must have 'rel_likes' property");
              assert.isNumber(item.rel_likes, 'item.rel_likes should be in Number format');
              if(item.stock === 'goog')
                assert.strictEqual(item.rel_likes, 1);
              if(item.stock === 'msft')
                assert.strictEqual(item.rel_likes, -1);
            }
            done();
        });
      });
      
      // .query({stock: ['goog', 'msft'], like: 'true'})
      test('2 stocks with like', (done) => {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft'], like: 'true'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response must have a stockData');
            assert.isArray(res.body.stockData, 'stockData must be an array');
            for(let item of res.body.stockData) {
              assert.property(item, 'symbol', 'each item in stockData needs a symbol');
              assert.isString(item.symbol, 'item.symbol must be in string format');
              assert.property(item, 'price', 'items must have price property');
              assert.isNumber(item.price, 'item.price must be in Number format');
              assert.property(item, 'rel_likes', "items must have 'rel_likes' property");
              assert.isNumber(item.rel_likes, 'item.rel_likes should be in Number format');
              if(item.stock === 'goog')
                assert.strictEqual(item.rel_likes, 0);
              if(item.stock === 'msft')
                assert.strictEqual(item.rel_likes, 0);
            }
            done();
        });
      });
      
    });

});
