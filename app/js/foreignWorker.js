import { generateSVG, generateAxis } from './chartUtils';
import { FOREIGN_WORKER_URL } from './constants';

class Chart {
  constructor(xScale, yScale, datas, svg) {
    this.xScale = xScale;
    this.yScale = yScale;
    this.datas  = datas;
    this.svg    = svg
  }
}

function drawBarChart(chart) {
  const { xScale, yScale, datas, svg } = chart;
  const barArea = svg.append('g').attr('class', 'bar-area')
  const stack = d3
    .stack()
    .order(d3.stackOrderDescending)
    .keys(['越南', '菲律賓', '泰國', '印尼', '其他'])(chart.datas);

  // setMouseEvents()

  
  const group = barArea
    .selectAll('g')
    .data(stack)
    .enter()
    .append('g')
      .attr('class', d => {
        switch (d.key) {
          case '越南':
           return 'color-1';
          case '菲律賓':
            return 'color-2';
          case '泰國':
            return 'color-3';
          case '印尼':
            return 'color-4';
          case '其他':
            return 'color-5';
          default:
            return 'color-1';
        }
      })
    .selectAll('rect')
    .data(d => d).enter()
    .append('rect')
      .attr('x', d => xScale(d.data['年份']))
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width', d => xScale.bandwidth())
    .call(console.log);

}

function drawChartByYear(year) {

}

function drawChart(datas) {
  console.table(datas);
  const width = 1600;
  const height = 400;

  const svg = generateSVG('#workerChart', width, height, {
    top: 10,
    bottom: 50,
    right: 90,
    left: 90
  });

  const xScale = d3
    .scaleBand()
    .padding(0.5)
    .domain(datas.map(d => +d['年份']))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 700000])
    .range([height, 0]);

  generateAxis(xScale, yScale, '', 10, 10)(svg, width, height);

  const chart = new Chart(xScale, yScale, datas, svg);
  window.chart = chart;
  
  drawBarChart(chart);
}

d3.csv(FOREIGN_WORKER_URL, (err, datas) => {

  drawChart(datas);
})


