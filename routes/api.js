/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const StockHandler = require('../controllers/stockHandler');

module.exports = (app) => {

  app.route('/api/stock-prices').get((req, res) => {
    
    if(!req.query.stock) res.status(400).send('missing query stock');
    else if(!Array.isArray(req.query.stock)) StockHandler.handleSingleStock(req, res);
    else StockHandler.handleMultiStocks(req, res);
    
  });
    
};
