import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Axios from "axios";

const Chart = () => {
  const [ticker, setTicker] = useState([]);

  // let ticker = [
  //   {
  //     Date: new Date("2023-01-1"),
  //     Open: 100,
  //     Close: 110,
  //     High: 120,
  //     Low: 95,
  //   },
  //   {
  //     Date: new Date("2023-01-2"),
  //     Open: 110,
  //     Close: 105,
  //     High: 115,
  //     Low: 100,
  //   },
  //   {
  //     Date: new Date("2023-01-3"),
  //     Open: 105,
  //     Close: 108,
  //     High: 112,
  //     Low: 102,
  //   },
  //   {
  //     Date: new Date("2023-01-4"),
  //     Open: 108,
  //     Close: 115,
  //     High: 118,
  //     Low: 105,
  //   },
  //   {
  //     Date: new Date("2023-01-5"),
  //     Open: 115,
  //     Close: 120,
  //     High: 125,
  //     Low: 110,
  //   },
  //   {
  //     Date: new Date("2023-01-6"),
  //     Open: 120,
  //     Close: 116,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-7"),
  //     Open: 116,
  //     Close: 118,
  //     High: 122,
  //     Low: 114,
  //   },
  //   {
  //     Date: new Date("2023-01-8"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-9"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-10"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-11"),
  //     Open: 120,
  //     Close: 118,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-12"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-13"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-14"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-15"),
  //     Open: 120,
  //     Close: 118,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-16"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-17"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-18"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-19"),
  //     Open: 120,
  //     Close: 118,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-20"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-21"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-22"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-23"),
  //     Open: 120,
  //     Close: 118,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-24"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-25"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-26"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-27"),
  //     Open: 120,
  //     Close: 118,
  //     High: 122,
  //     Low: 115,
  //   },
  //   {
  //     Date: new Date("2023-01-28"),
  //     Open: 118,
  //     Close: 122,
  //     High: 125,
  //     Low: 116,
  //   },
  //   {
  //     Date: new Date("2023-01-29"),
  //     Open: 122,
  //     Close: 124,
  //     High: 128,
  //     Low: 120,
  //   },
  //   {
  //     Date: new Date("2023-01-30"),
  //     Open: 124,
  //     Close: 120,
  //     High: 126,
  //     Low: 115,
  //   },
  // ];

  const heatmapData = [];
  for (let i = 1; i <= 30; i++) {
    let temp = [];
    for (let j = 96; j <= 129; j++) {
      temp.push({
        date: new Date(`2023-01-${i}`),
        variable: j,
        value:
          j % (Math.floor(Math.random() * 50) + 1) === 0 ||
          i % (Math.floor(Math.random() * 50) + 1) === 0
            ? Math.random()
            : 1,
      });
    }
    heatmapData.push(...temp);
  }

  useEffect(() => {
    const width = 1600;
    const height = 900;
    const marginTop = 0;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    // Append axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        `translate(-40 ,${height - marginBottom - marginTop})`
      );

    svg.append("g").attr("class", "y-axis");

    let data = JSON.stringify({
      query:
        'query MyQuery {\n  EVM(network: eth, dataset: archive) {\n    DEXTradeByTokens(\n      orderBy: {ascendingByField: "Block_OHLC_interval"}\n      where: {Trade: {Currency: {SmartContract: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}},Side: {Currency: {SmartContract: {is: "0xdac17f958d2ee523a2206206994597c13d831ec7"}}}}\n      Block:{Time:{since:"2023-12-05T00:00:40Z", till:"2024-01-05T00:00:40Z"}}\n  \n      }\n      limit: {count: 15000}\n    ) {\n    Block {\n         OHLC_interval: Time(interval: {in: minutes, count:1})\n      }\n     \n      volume: sum(of: Trade_Amount)\n      Trade {\n        high: Price(maximum: Trade_Price, selectWhere:{lt:20000})\n        low: Price(minimum: Trade_Price, selectWhere:{lt:20000})\n        open: Price(minimum: Block_Number, selectWhere:{lt:20000})\n        close: Price(maximum: Block_Number, selectWhere:{lt:20000})\n      }\n      count\n    }\n  }\n}\n',
      mode: "cors",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/graphql",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYPTOu4f3goCPyot5oxvk0dyXvqjjc3",
        Authorization:
          "Bearer ory_at_kgwkz7pylP47VZGGbu5QMazAmMiueXgQuH1pVIUa9l4.PHTL6C6JQEmH22cAZVcL5AluLR8dh_6opdmfOUbAAqE",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        let temp = [];
        for (let i = 100; i > -1; i--) {
          const data = response.data.data.EVM.DEXTradeByTokens[i];
          if (data) {
            const open = Number(data.Trade.open.toFixed(18));
            const close = Number(data.Trade.close.toFixed(18));
            let high = Number(data.Trade.high.toFixed(18));
            let low = Number(data.Trade.low.toFixed(18));
            const resdate = new Date(data.Block.OHLC_interval);
            let bar = {
              time: resdate.getTime(),
              open: open,
              high: high,
              low: low,
              close: close,
              volume: Number(data.volume),
            };
            temp.push(bar);
            // console.log(bar);
          }
        }
        setTicker(temp);
      })
      .catch((error) => {
        // console.log(error);
      });
  }, []);
  console.log(ticker);
  useEffect(() => {
    const width = 1600;
    const height = 900;
    const marginTop = 0;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3
      .select("#chart svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(ticker.map((d) => d.time))
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLog()
      .domain([d3.min(ticker, (d) => d.low), d3.max(ticker, (d) => d.high)])
      .rangeRound([height - marginBottom, marginTop]);

    svg
      .select(".x-axis")
      .attr("transform", `translate(-40, ${height - marginBottom - marginTop})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d %h-%m")))
      .call((g) => g.select(".domain").remove());

    svg
      .select(".y-axis")
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d3.format(".1f"))
          .tickValues(d3.scaleLinear().domain(y.domain()).ticks())
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("stroke-opacity", 0.2)
          .attr("x2", width - marginLeft - marginRight)
      )
      .call((g) => g.select(".domain").remove());

    // const heatmapColorScale = d3
    //   .scaleSequential()
    //   .interpolator(d3.interpolatePurples)
    //   .domain([0, d3.max(heatmapData, (d) => d.value)]);

    // const heatmapRects = svg
    //   .selectAll(".heatmap-rect")
    //   .data(heatmapData, (d) => d.time);

    // heatmapRects.exit().remove();

    // heatmapRects
    //   .enter()
    //   .append("rect")
    //   .attr("class", "heatmap-rect")
    //   .attr("x", (d) => x(d.time))
    //   .attr("y", (d) => y(d.variable))
    //   .attr("width", x.bandwidth())
    //   .attr("height", marginBottom)
    //   .attr("fill", (d) => heatmapColorScale(d.value))
    //   .append("title");

    const candlestickWidth = 10;

    const bars = svg.selectAll(".bar").data(ticker, (d) => d.time);

    bars.exit().remove();

    const g = bars
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr(
        "transform",
        (d) =>
          `translate(${x(d.time) + x.bandwidth() / 2 - candlestickWidth / 2},0)`
      );

    g.append("line")
      .attr("y1", (d) => y(d.low))
      .attr("y2", (d) => y(d.high))
      .attr("stroke", (d) =>
        d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
      );

    g.append("line")
      .attr("y1", (d) => y(d.open))
      .attr("y2", (d) => y(d.close))
      .attr("stroke-width", candlestickWidth)
      .attr("stroke", (d) =>
        d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
      );

    const formatDate = d3.timeFormat("%Y-%m-%d");
    const formatValue = d3.format(".1f");
    const formatChange = (
      (f) => (y0, y1) =>
        f((y1 - y0) / y0)
    )(d3.format("+.2%"));

    g.append("title").text(
      (d) => `${formatDate(d.time)}
            Open: ${formatValue(d.open)}
            Close: ${formatValue(d.close)} (${formatChange(d.open, d.close)})
            Low: ${formatValue(d.low)}
            High: ${formatValue(d.high)}`
    );
  }, [ticker, heatmapData]);

  return <div id="chart"></div>;
};

export default Chart;
