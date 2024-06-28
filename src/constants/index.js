const BASE_URL = "https://api.binance.com/api/v3/";

export const tickerConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: BASE_URL + "klines?symbol=BTCUSDT&interval=1m&limit=200",
  headers: {
    "Content-Type": "application/json",
  },
};
export const orderBookConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: BASE_URL + "depth?symbol=BTCUSDT&limit=100",
  headers: {
    "Content-Type": "application/json",
  },
};
