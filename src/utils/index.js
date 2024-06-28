export const processOrderBook = (orderBook, gap, time) => {
  const processEntries = (entries) => {
    const groupedEntries = {};

    entries.forEach((entry) => {
      const price = parseFloat(entry[0]);
      const amount = parseFloat(entry[1]);
      const groupPrice = Math.floor(price / gap) * gap;

      if (groupedEntries[groupPrice]) {
        groupedEntries[groupPrice] += amount;
      } else {
        groupedEntries[groupPrice] = amount;
      }
    });

    return Object.keys(groupedEntries).map((price) => ({
      time: time,
      price: parseFloat(price).toFixed(0),
      value: groupedEntries[price].toFixed(0),
    }));
  };

  return processEntries(orderBook.bids.concat(orderBook.asks));
};
