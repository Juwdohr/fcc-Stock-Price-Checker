const fetch = require('node-fetch'),
      assert = require('chai').assert;

const StockModel = require('../models/Stock');

const getStockPrice = (symbol) => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.iextrading.com/1.0/stock/${symbol}/quote`).then(res => res.json()).then(json => resolve(json.latestPrice));
  });
}
const saveStock = (data) => {
  return new Promise((resolve, reject) => {
    StockModel.create({...data}, (err, doc) => {
      if(err) return reject(err);
      resolve({ symbol: doc.symbol, price: doc.price, likes: doc.likesList.length });
    });
  });
}
const update = (data) => {
  return new Promise((resolve, reject) => {
    data.save((err, doc) => {
      if(err) return reject(err);
      resolve({ symbol: doc.symbol, price: doc.price, likes: doc.likesList.length });
    });
  });
}
const filterData = (stocks, docs) => {
  return new Promise((resolve, reject) => {
    stocks.find((stock, indx) => {
      for(let doc of docs){
        if (doc.symbol === stock.symbol){
          stocks[indx] = doc;
        }
      }
    });
    resolve(stocks);
  });
}
const formatMultiStockData = (data) => {

  return new Promise((resolve, reject) => {
    const stocks = data.map((stock) => {
      return {
        symbol: stock.symbol,
        price: stock.price,
        likes: stock.likesList.length
      }
    });
    
    stocks[0].rel_likes = stocks[0].likes - stocks[1].likes;
    stocks[1].rel_likes = stocks[1].likes - stocks[0].likes;
    
    delete stocks[0].likes
    delete stocks[1].likes;
    
    resolve(stocks);
  });
}


const createStock = async (stockData, response) => {
  stockData.price = await getStockPrice(stockData.symbol);
  response.json({ stockData: await saveStock(stockData) });
}
const createMultiStocks = async (dataSet, response) => {
  const stockData = []
  for(let data of dataSet) {
    data.price = await getStockPrice(data.symbol);
    stockData.push(await saveStock(data));
  }
  
  stockData = formatMultiStockData(stockData);
  
  response.json({ stockData });
   
}
const updateStock = async (stockData, response) => {
  stockData.price = await getStockPrice(stockData.symbol);
  response.json({stockData: await update(stockData)})
}
const updateMultiStocks = async (stocks, docs, response) => {
  const stockData = await filterData(stocks, docs);
  for(let stock of stockData) {
    if(stock._id) {
      stock = await update(stock);
    } else {
      stock.price = await getStockPrice(stock.symbol);
      stock = await saveStock(stock);
    }
  }
  
  response.json({ stockData: await formatMultiStockData(stockData)});
  
}

module.exports = {
  handleSingleStock: (req, res) => {
    const stock = { symbol: req.query.stock };
    
    StockModel.findOne({ symbol: stock.symbol }, (err, doc) => {
      assert.ifError(err)
      
      if(!doc) {
        (req.query.like) ? stock.likesList = [req.ip] : stock.likesList = [];
        createStock(stock, res);
      } else {
        (req.query.like && !doc.likesList.includes(req.ip)) ? doc.likesList = [...doc.likesList, req.ip] : doc.likesList = [...doc.likesList];
        updateStock(doc, res);
      }
      
    });
  },
  handleMultiStocks: (req, res) => {
    const stocks = [
      { symbol: req.query.stock[0] },
      { symbol: req.query.stock[1] } 
    ];
    
    StockModel.find({ symbol: {$in: req.query.stock} }, (err, docs) => {
      assert.ifError(err)
      
      if(docs.length === 0) {
        for(let stock of stocks) (req.query.like) ? stock.likesList = [req.ip] : stock.likesList = [];
        createMultiStocks(stocks, res);
      } else {
        for(let stock of stocks) (req.query.like) ? stock.likesList = [req.ip] : stock.likesList = [];
        for(let doc of docs) (req.query.like && !doc.likesList.includes(req.ip)) ? doc.likesList = [...doc.likesList, req.ip] : doc.likesList = [...doc.likesList];
        updateMultiStocks(stocks, docs, res);
      }
    });
  }
}