const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://vedanth1112:Masonmount3900@assignment-3-cluster.b3ibtuy.mongodb.net/?retryWrites=true&w=majority&appName=Assignment-3-Cluster";
const port = parseInt(process.env.PORT) || 8080;
app.use(express.json());
app.use(cors());
require('dotenv').config();
const API_KEY = process.env.API_KEY;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/search/:stockTicker', async function (req, res) {

    console.log("Search API");
    const stockTickerSymbol = req.params.stockTicker;
    console.log(process.env.API_KEY)
    try {
        const stockProfileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: {
                token: API_KEY,
                symbol: stockTickerSymbol
            }
        });

        const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
            params: {
                token: API_KEY,
                symbol: stockTickerSymbol
            }
        });

        const companyPeersResponse = await axios.get('https://finnhub.io/api/v1/stock/peers', {
            params: {
                token: API_KEY,
                symbol: stockTickerSymbol
            }
        });

        console.log("Stock profile response is:", stockProfileResponse.data);
        let combinedStockTabResponse = {
            stockProfile: stockProfileResponse.data,
            latestPrice: latestPriceResponse.data,
            companyPeers: companyPeersResponse.data
        };


        console.log("Combined response is", combinedStockTabResponse);
        res.send(combinedStockTabResponse);

    } catch (error) {
        console.log("Error is:", error.response.data);
        res.status(500).json({ error: error.message });
    }
});

app.get('/latestPrice/:stockTicker', async function (req, res) {

    const stockTickerSymbol = req.params.stockTicker;

    try {
        const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
            params: {
                token: API_KEY,
                symbol: stockTickerSymbol
            }
        });

        if (!latestPriceResponse.data) {
            return res.status(400).json({ error: 'Latest price not found. Please check stock ticker symbol again.' });
        }

        res.send(latestPriceResponse.data);

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/chartsHourly/:stockTicker', async function (req, res) {

    const stockTickerSymbol = req.params.stockTicker;
    console.log("Charts Hourly API");
    try {
        const multiplier = 1;
        const timespan = 'hour';

        const to_date = new Date(new Date() - 24 * 60 * 60 * 1000); // 1 day ago
        const from_date = new Date(to_date - 7 * 24 * 60 * 60 * 1000); // 24 hours ago

        console.log("To date is:", to_date);
        console.log("From date is:", from_date);

        const to_date_str = to_date.toISOString().split('T')[0];
        const from_date_str = from_date.toISOString().split('T')[0];

        const api_url = `https://api.polygon.io/v2/aggs/ticker/${stockTickerSymbol}/range/${multiplier}/${timespan}/${from_date_str}/${to_date_str}?adjusted=true&sort=asc&apiKey=mwjPq5ceMqn18edHgYpUrK5ZgBul4p2v`;
        console.log(api_url);
        const response = await axios.get(api_url);
        // const chartsHourlyResponse = convertTimestampToPST(response.data);
        const chartsHourlyResponse = response.data;

        // console.log("Charts hourly response is:", chartsHourlyResponse);

        if (!chartsHourlyResponse) {
            return res.status(400).json({ error: 'Chart details not found. Please check stock ticker symbol again.' });
        }

        res.send(chartsHourlyResponse.results);

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/charts/:stockTicker', async function (req, res) {

    const stockTickerSymbol = req.params.stockTicker;
    console.log("Charts API");
    try {
        const multiplier = 1;
        const timespan = 'day';

        const to_date = new Date(new Date() - 24 * 60 * 60 * 1000);
        const from_date = new Date(to_date - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago

        console.log("To date is:", to_date);
        console.log("From date is:", from_date);

        const to_date_str = to_date.toISOString().split('T')[0];
        const from_date_str = from_date.toISOString().split('T')[0];

        const api_url = `https://api.polygon.io/v2/aggs/ticker/${stockTickerSymbol}/range/${multiplier}/${timespan}/${from_date_str}/${to_date_str}?adjusted=true&sort=asc&apiKey=mwjPq5ceMqn18edHgYpUrK5ZgBul4p2v`;
        console.log(api_url);
        const response = await axios.get(api_url);

        const chartDetails = response.data;
        // console.log("Chart details are:", chartDetails);

        if (!chartDetails) {
            return res.status(400).json({ error: 'Chart details not found. Please check stock ticker symbol again.' });
        }

        res.send(chartDetails.results);

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.get('/news/:stockTicker', async function (req, res) {

    try {
        const stockTicker = req.params.stockTicker;
        const now = new Date(new Date() - 24 * 60 * 60 * 1000);
        const from_date = new Date(now - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const from_date_str = from_date.toISOString().split('T')[0];
        const to_date_str = now.toISOString().split('T')[0];

        const response = await axios.get('https://finnhub.io/api/v1/company-news', {
            params: {
                symbol: stockTicker,
                from: from_date_str,
                to: to_date_str,
                token: API_KEY,
            },
        });

        // console.log("Company news response is:", response);

        const companyNews = filterCompleteEntries(response.data);
        if (!companyNews.length) {
            return res.status(400).json({ error: 'Company news not found' });
        }

        res.send(companyNews.slice(0, 20));

    } catch (error) {
        console.error('Error fetching company news:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/insights/:stockTicker', async function (req, res) {

    try {

        const stockTicker = req.params.stockTicker;

        const recommendationResponse = await axios.get('https://finnhub.io/api/v1/stock/recommendation', {
            params: {
                token: API_KEY,
                symbol: stockTicker
            }
        });

        // console.log(recommendationResponse);

        const now = new Date(new Date() - 24 * 60 * 60 * 1000);
        const to_date_str = now.toISOString().split('T')[0];
        const from_date_str = "2022-01-01";

        const insiderSentimentResponse = await axios.get('https://finnhub.io/api/v1/stock/insider-sentiment', {
            params: {
                token: API_KEY,
                symbol: stockTicker,
                from: from_date_str,
                to: to_date_str
            }
        });

        // console.log(insiderSentimentResponse);

        const earningsResponse = await axios.get('https://finnhub.io/api/v1/stock/earnings', {
            params: {
                token: API_KEY,
                symbol: stockTicker
            }
        });

        // console.log(earningsResponse);

        let combinedInsightsResponse = {
            stockRecommendations: recommendationResponse.data,
            insiderSentiments: insiderSentimentResponse.data,
            companyEarnings: earningsResponse.data
        };

        res.send(combinedInsightsResponse);

    } catch (error) {

        console.error('Error fetching company insights:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
        ``
    }
});


app.get('/autoComplete/:query', async function (req, res) {

    const query = req.params.query;

    const autoCompleteResponse = await axios.get('https://finnhub.io/api/v1/search', {
        params: {
            q: query,
            token: API_KEY
        }
    });

    res.send(autoCompleteResponse.data.result);
});


function filterCompleteEntries(articles) {
    // Filter articles that do not have an empty title, an empty image URL, and image URL not containing "s.yimg.com"
    return articles.filter(article =>
        article.title !== '' &&
        article.image !== '' &&
        !article.image.includes('s.yimg.com')
    );
}

function convertTimestampToPST(response) {
    const results = response.results.map(item => {
        const date = new Date(item.t);
        const pstDate = date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        console.log("PST Date is:", pstDate);
        return { ...item, t: pstDate };
    });

    return { ...response, results };
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        // List the available databases
        const databases = await client.db().admin().listDatabases();
        console.log("Available databases:", databases);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


app.post('/insertStockWishlist', async function (req, res) {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const dbName = "StockAssignment";
    const collectionName = "StockWishlist";

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const stockData = req.body;

    console.log("Stock data is:", stockData);

    const filter = { ticker: stockData.stockTicker };
    const update = { $set: stockData };
    const options = { upsert: true };

    const result = await collection.updateOne(filter, update, options);
    console.log(`${result.modifiedCount} document(s) updated`);

    res.status(200).send({ message: 'Stock wishlist updated'});
});

app.get('/getStockWishlist/:stockTicker', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockWishlist";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const stockTickerSymbol = req.params.stockTicker;
        const stockData = await collection.findOne({ ticker: stockTickerSymbol });
        if (stockData) {
            const stockTickerSymbol = stockData.ticker;

            const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
                params: {
                    token: API_KEY,
                    symbol: stockTickerSymbol
                }
            });

            console.log("Latest price response for: " + stockTickerSymbol, latestPriceResponse.data);
            const priceData = await latestPriceResponse.data;

            const wishlistDataResponse = {
                ticker: stockTickerSymbol,
                companyName: stockData.companyName,
                price: parseFloat((priceData.c).toFixed(2)),
                changePrice: parseFloat((priceData.dp).toFixed(2)),
                changePricePercent: (priceData.dp).toFixed(2) + '%',
                isPositive: priceData.dp > 0
            };

            res.send(wishlistDataResponse);
        } else {
            res.status(404).json({ error: 'Stock not found' });
        }
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/getAllStocksWishlist', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockWishlist";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const wishlistStockData = await collection.find().toArray();

        const wishlistDataResponse = await Promise.all(wishlistStockData.map(async (stock) => {
            const stockTickerSymbol = stock.ticker;

            const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
                params: {
                    token: API_KEY,
                    symbol: stockTickerSymbol
                }
            });

            console.log("Latest price response for:" + stockTickerSymbol, latestPriceResponse.data);
            const priceData = await latestPriceResponse.data;

            return {

                ticker: stockTickerSymbol,
                companyName: stock.companyName,
                price: priceData.c,
                changePrice: priceData.d,
                changePricePercent: (priceData.dp).toFixed(2) + '%',
                isPositive: priceData.dp > 0
            };
        }));

        res.send(wishlistDataResponse);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/deleteStockFromWishlist/:stockTicker', async function (req, res) {
    try {
        console.log("Delete API");
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockWishlist";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const stockTickerSymbol = req.params.stockTicker;
        const result = await collection.deleteOne({ ticker: stockTickerSymbol });
        if (result.deletedCount === 1) {
            res.status(200).send({ message: 'Stock deleted from wishlist' });
        } else {
            res.status(404).json({ error: 'Stock not found' });
        }
    } catch (error) {
        console.error('Error deleting stock:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/insertIntoPortfolio', async (req, res) => {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockPortfolio";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const stockTickerSymbol = req.body.ticker;

        const { _id, ...bodyWithoutId } = req.body; // Exclude '_id' from the body

        const filter = { ticker: stockTickerSymbol };
        const update = { $set: bodyWithoutId }; // Use the body without '_id'
        const options = { upsert: true };

        const result = await collection.updateOne(filter, update, options);
        const delResult = await collection.deleteMany({ quantity: { $lte: 0 } });

        console.log(`${result.modifiedCount} document(s) updated`);

        res.status(200).send({ message: 'Stock portfolio updated'});
    } catch (error) {
        console.error('Error updating stock portfolio:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/getAllPortfolioData', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockPortfolio";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const portfolioData = await collection.find().toArray();
        const portoflioDataResponse = await Promise.all(portfolioData.map(async (stock) => {
            const stockTickerSymbol = stock.ticker;

            const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
                params: {
                    token: API_KEY,
                    symbol: stockTickerSymbol
                }
            });

            console.log("Latest price response for:" + stockTickerSymbol, latestPriceResponse.data);
            const priceData = await latestPriceResponse.data;

            return {
                ticker: stockTickerSymbol,
                quantity: stock.quantity,
                totalCost: parseFloat(stock.totalCost),
                averagePrice: parseFloat((stock.totalCost / stock.quantity).toFixed(2)),
                price: priceData.c,
                marketValue: parseFloat((priceData.c * stock.quantity).toFixed(2)),
                changePrice: parseFloat((priceData.c - (stock.totalCost / stock.quantity)).toFixed(2)),
                changePricePercent: ((priceData.c - (stock.totalCost / stock.quantity)) / (stock.totalCost / stock.quantity) * 100).toFixed(2) + '%',
                isPositive: priceData.c > (stock.totalCost / stock.quantity)
            };
        }));
        res.send(portoflioDataResponse);
    } catch (error) {
        console.error('Error fetching portfolio data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/getPortfolioData/:stockTicker', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockPortfolio";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const stockTickerSymbol = req.params.stockTicker;
        const portfolioData = await collection.findOne({ ticker: stockTickerSymbol });

        console.log("Portfolio data is:", portfolioData);
        if (portfolioData) {
            const stockTickerSymbol = portfolioData.ticker;

            const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
                params: {
                    token: API_KEY,
                    symbol: stockTickerSymbol
                }
            });

            console.log("Latest price response for: " + stockTickerSymbol, latestPriceResponse.data);
            const priceData = await latestPriceResponse.data;

            const portfolioDataResponse = {
                ticker: stockTickerSymbol,
                quantity: portfolioData.quantity,
                totalCost: parseFloat(portfolioData.totalCost),
                averagePrice: parseFloat((portfolioData.totalCost / portfolioData.quantity).toFixed(2)),
                price: priceData.c,
                marketValue: parseFloat((priceData.c * portfolioData.quantity).toFixed(2)),
                changePrice: parseFloat((priceData.c - (portfolioData.totalCost / portfolioData.quantity)).toFixed(2)),
                changePricePercent: ((priceData.c - (portfolioData.totalCost / portfolioData.quantity)) / (portfolioData.totalCost / portfolioData.quantity) * 100).toFixed(2) + '%',
                isPositive: priceData.c > (portfolioData.totalCost / portfolioData.quantity)
            };

            res.send(portfolioDataResponse);

        } else {
            let object = { ticker: stockTickerSymbol, quantity: 0, averagePrice: 0, totalInvestment: 0 };
            res.status(404).json({ data: object });
        }
    } catch (error) {
        console.error('Error fetching portfolio data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/deleteFromPortfolio/:stockTicker', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "StockPortfolio";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const stockTickerSymbol = req.params.stockTicker;
        const result = await collection.deleteOne({ ticker: stockTickerSymbol });
        if (result.deletedCount === 1) {
            res.status(200).send("Stock deleted from portfolio");
        } else {
            res.status(404).json({ error: 'Stock not found in portfolio' });
        }
    } catch (error) {
        console.error('Error deleting stock from portfolio:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/wallet', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "WalletBalance";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const walletData = await collection.findOne();
        console.log("Wallet data is:", walletData);
        res.send({ balance: walletData.balance });
    } catch (error) {
        console.error('Error fetching wallet data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/updateWalletBalance', async function (req, res) {
    try {
        await client.connect();
        const dbName = "StockAssignment";
        const collectionName = "WalletBalance";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const newBalance = req.body.balance;
        await collection.updateOne({}, { $set: { balance: newBalance } });
        res.status(200).send({ message: 'Wallet balance updated' });
    } catch (error) {
        console.error('Error updating wallet balance:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ` + port);
    run().catch(console.dir);
});
