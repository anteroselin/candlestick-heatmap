import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Axios from "axios";
import { debounce } from "lodash";
import { orderBookConfig, tickerConfig } from "../constants";

const Chart = () => {
  const [ticker, setTicker] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [msg, setMsg] = useState("");
  const svgRef = useRef();

  const updateOrderBook = useCallback(
    debounce((data) => {
      setOrderBook({ bids: data.bids, asks: data.asks });
    }, 500),
    []
  );

  const initialAxis = () => {
    const width = 1600;
    const height = 900;
    const marginTop = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        `translate(-40 ,${height - marginBottom - marginTop})`
      );

    svg.append("g").attr("class", "y-axis");
  };

  const fetchSeries = () => {
    Axios.request(tickerConfig)
      .then((response) => {
        const { data } = response;
        const series = data.map((item) => ({
          time: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
          volume: item[5],
        }));
        setTicker(series);
      })
      .catch((error) => {
        console.log(error);
      });
    Axios.request(orderBookConfig)
      .then((response) => {
        const { data } = response;
        updateOrderBook(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    initialAxis();
    fetchSeries();
    let timer = setInterval(() => {
      fetchSeries();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (ticker.length === 0) return;

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

    const chartX = d3
      .scaleBand()
      .domain(ticker.map((d) => d.time))
      .range([marginLeft, width - marginRight]);

    const x = d3
      .scaleTime()
      .domain([d3.min(ticker, (d) => d.time), d3.max(ticker, (d) => d.time)])
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(ticker, (d) => d.low), d3.max(ticker, (d) => d.high)])
      .rangeRound([height - marginBottom, marginTop]);

    svg
      .select(".x-axis")
      .attr("transform", `translate(-40, ${height - marginBottom - marginTop})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%d %H-%M")))
      .call((g) => g.select(".domain").remove());

    svg
      .select(".y-axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0f")))
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("stroke-opacity", 0.2)
          .attr("x2", width - marginLeft - marginRight)
      )
      .call((g) => g.select(".domain").remove());

    const candlestickWidth = 2;

    const bars = svg
      .selectAll(".bar")
      .data(ticker, (d) => `${d.time}-${d.open}-${d.high}-${d.low}-${d.close}`);

    bars.exit().remove();

    const enterBars = bars.enter().append("g").attr("class", "bar");

    enterBars
      .merge(bars)
      .attr(
        "transform",
        (d) => `translate(${x(d.time) - candlestickWidth / 2},0)`
      );

    enterBars
      .append("line")
      .merge(bars.select("line.high-low"))
      .attr("class", "high-low")
      .attr("y1", (d) => y(d.low))
      .attr("y2", (d) => y(d.high))
      .attr("stroke", (d) =>
        d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
      );

    enterBars
      .append("rect")
      .merge(bars.select("rect.candle"))
      .attr("class", "candle")
      .attr("y", (d) => y(Math.max(d.open, d.close)))
      .attr("width", candlestickWidth)
      .attr("height", (d) => Math.abs(y(d.open) - y(d.close)))
      .attr("fill", (d) =>
        d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
      );

    enterBars.append("title").text(
      (d) => `${d3.timeFormat("%Y-%m-%d")(d.time)}
            Open: ${d.open}
            Close: ${d.close}
            Change: ${(d.close - d.open) / d.open}`
    );
    // const g = bars
    //   .enter()
    //   .append("g")
    //   .attr("class", "bar")
    //   .attr(
    //     "transform",
    //     (d) =>
    //       `translate(${
    //         x(d.time) + chartX.bandwidth() / 2 - candlestickWidth / 2
    //       },0)`
    //   );

    // g.append("line")
    //   .attr("class", "high-low")
    //   .attr("y1", (d) => y(d.low))
    //   .attr("y2", (d) => y(d.high))
    //   .attr("stroke", (d) =>
    //     d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
    //   );

    // g.append("line")
    //   .attr("class", "high-low")
    //   .attr("y1", (d) => y(d.open))
    //   .attr("y2", (d) => y(d.close))
    //   .attr("stroke-width", candlestickWidth)
    //   .attr("stroke", (d) =>
    //     d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
    //   );

    // const formatDate = d3.timeFormat("%Y-%m-%d");
    // const formatValue = d3.format(".0f");
    // const formatChange = (
    //   (f) => (y0, y1) =>
    //     f((y1 - y0) / y0)
    // )(d3.format("+.2%"));

    // g.append("title").text(
    //   (d) => `${formatDate(d.time)}
    //         Open: ${formatValue(d.open)}
    //         Close: ${formatValue(d.close)}
    //         Change: ${formatChange(d.open, d.close)}`
    // );
  }, [ticker]);

  return <div id="chart" ref={svgRef}></div>;
};

export default Chart;
