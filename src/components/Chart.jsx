import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Axios from "axios";
import { debounce } from "lodash";
import { orderBookConfig, tickerConfig } from "../constants";
import { processOrderBook } from "../utils";
import moment from "moment";

const Chart = () => {
  const [ticker, setTicker] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const [candlestickWidth, setCandleStickWidth] = useState(5);
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
    const marginLeft = 150;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${marginLeft},${marginTop})`);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        `translate(${-marginLeft} ,${height - marginBottom - marginTop})`
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
    const marginBottom = 30;
    const marginRight = 30;
    const marginLeft = 150;

    const svg = d3.select(svgRef.current).select("svg");

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

    svg.selectAll(".x-axis").selectAll("*").remove();
    svg.selectAll(".y-axis").selectAll("*").remove();

    svg
      .select(".x-axis")
      .attr(
        "transform",
        `translate(${-marginLeft}, ${height - marginBottom - marginTop})`
      )
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%m/%d %H:%M")))
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
      .attr("transform", (d) => `translate(${-(candlestickWidth / 2)},0)`)
      .attr("fill", (d) =>
        d.open > d.close ? "#e41a1c" : d.close > d.open ? "#4daf4a" : "#000000"
      );

    const tooltip = d3
      .select("#chart")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #000")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none");

    tooltip.exit().remove();

    enterBars
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(
          `Date: ${d3.timeFormat("%m/%d %H:%M")(d.time)}<br>
            Open: ${Number(d.open).toFixed(2)}<br>
            High: ${Number(d.high).toFixed(2)}<br>
            Low: ${Number(d.low).toFixed(2)}<br>
            Close: ${Number(d.close).toFixed(2)}<br>
            Volume: ${Number(d.volume).toFixed(2)}<br>`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    if (heatmapData.length === 0) return;

    const colorScale = d3
      .scaleSequential(
        [0, d3.max(heatmapData, (d) => Number(d.value))],
        d3.interpolatePurples
      )
      .domain([0, d3.max(heatmapData, (d) => Number(d.value))]);

    const heatmap = svg
      .selectAll(".heatmap-rect")
      .data(heatmapData, (d) => `${d.time}-${d.price}`);

    heatmap.exit().remove();

    heatmap
      .enter()
      .append("rect")
      .attr("class", "heatmap-rect")
      .merge(heatmap)
      .attr("x", (d) => x(d.time))
      .attr("y", (d) => y(d.price))
      .attr("width", candlestickWidth)
      .attr("height", 10)
      .style("fill", (d) => colorScale(Number(d.value)))
      .on("mouseover", (event, d) => {
        const previousTime = moment(d.time)
          .subtract(1, "m")
          .format("DD/MM, HH:mm");
        const currentTime = moment(d.time).format("DD/MM, HH:mm");
        tooltip
          .style("visibility", "visible")
          .html(
            `Date: ${previousTime} - ${currentTime}<br>Price: $${
              d.price
            }<br>Quantity: ${Number(d.value)}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    const AxisSvg = d3.select(svgRef.current).select(".axis");
    AxisSvg.selectAll(".color-scale-bar").remove(); // Remove existing color scale bar if any

    const colorScaleBar = AxisSvg.append("g").attr("class", "color-scale-bar");

    const colorAxisScale = d3
      .scaleLinear()
      .domain([0, d3.max(heatmapData, (d) => Number(d.value))])
      .range([height - marginBottom, marginTop]);

    const colorAxis = d3.axisLeft(colorAxisScale).ticks(4);

    const defs = AxisSvg.append("defs");

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("gradientTransform", "rotate(90)");

    linearGradient
      .selectAll("stop")
      .data(d3.range(0, 1.01, 0.01))
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d * 100}%`)
      .attr("stop-color", (d) =>
        colorScale((1 - d) * d3.max(heatmapData, (d) => Number(d.value)))
      );

    colorScaleBar
      .append("rect")
      .attr("x", -marginLeft + 20)
      .attr("y", marginTop)
      .attr("width", 80)
      .attr("height", height - marginBottom - marginTop)
      .style("fill", "url(#linear-gradient)");

    colorScaleBar
      .append("g")
      .attr("class", "color-axis")
      .attr("transform", `translate(${-marginLeft + 20}, 0)`)
      .call(colorAxis);
  }, [ticker, heatmapData]);

  useEffect(() => {
    if (
      ticker.length === 0 ||
      (orderBook.bids.length === 0 && orderBook.asks.length === 0)
    )
      return;
    const tempData = processOrderBook(
      orderBook,
      10,
      ticker[ticker.length - 1].time
    );
    if (
      heatmapData.length > 0 &&
      ticker[ticker.length - 1].time ===
        heatmapData[heatmapData.length - 1].time
    )
      return;
    setHeatmapData((prev) => [...prev, ...tempData]);
  }, [orderBook]);

  return <div id="chart" ref={svgRef}></div>;
};

export default Chart;
