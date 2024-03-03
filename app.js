const express = require('express');
const app = express();
const axios = require('axios');

app.get('/search/:stockTicker', async function (req, res) {

    const stockTickerSymbol = req.params.stockTicker;

    try {
        const stockProfileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: {
                token: 'cmuk1nhr01qltmc0qh1gcmuk1nhr01qltmc0qh20',
                symbol: stockTickerSymbol
            }
        });

        const latestPriceResponse = await axios.get('https://finnhub.io/api/v1/quote', {
            params: {
                token: 'cmuk1nhr01qltmc0qh1gcmuk1nhr01qltmc0qh20',
                symbol: stockTickerSymbol
            }
        });

        const companyPeersResponse = await axios.get('https://finnhub.io/api/v1/stock/peers', {
            params: {
                token: 'cmuk1nhr01qltmc0qh1gcmuk1nhr01qltmc0qh20',
                symbol: stockTickerSymbol
            }
        });

        // Charts API to fetch past 6 hours data and plot it


        let combinedResponse = {
            stockProfile: stockProfileResponse.data,
            latestPrice: latestPriceResponse.data,
            companyPeers: companyPeersResponse.data
        };


        console.log("Combined response is", combinedResponse);
        res.send(combinedResponse);

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});




app.listen('3000', () => {
    console.log(`Server is running on port 3000`);
});
