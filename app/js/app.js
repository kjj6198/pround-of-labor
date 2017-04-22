import 'main.scss';
import "affix.jquery";
import "./storys";

import { numToCurrency } from './utils';

const normalizeData = (datas) => d3.nest().key(d => d["年份"]).entries(datas);
const bindMousemove = (xScale, yScale, datas) => (...args) => {
  const target = args[2][0];
  const [xCoords] = d3.mouse(target);
  const targetYear = Math.round(xScale.invert(xCoords));
  const prevYear = $('#chartArea').attr('data-current-year');

  if (targetYear === prevYear || targetYear < 62) { return ; }  
  const targetData = datas.filter(d => +d['年份'] === +targetYear)[0];

  updateBoardDisplay(targetData, normalizeData(datas));
  showSalaryDetail('', targetData);

  d3
    .select('.guide-line')
    .attr('x1', xCoords)
    .attr('x2', xCoords)

  d3.select('.guide-circle')
    .attr('r', 15)
    .attr('cx', xCoords)
    .attr('cy', yScale(targetData['平均薪資']))

  $('#chartArea').attr('data-current-year', targetYear);
  $('.currentYear > text')[0].textContent = `民國 ${targetYear} 年`;
}

function moveGuideline(year) {

  return function(datas) {
    const data = datas.filter(d => +d['年份'] === +year);
  }
}

function updateBoardDisplay(data, datas) {  
  const jobless = document.querySelector('#jobless > .number');
  const hours   = document.querySelector('#hours > .number');
  const price   = document.querySelector('#price > .number');
  const prevYear = $('#chartArea').attr('data-current-year');

  const [prevData] = datas.filter(d => +d.key === +prevYear);
  if (!prevData || prevYear <= 62) { return ; }
  
  d3.selectAll('.number')
    .transition()
    .duration(600)
    .tween('number', () => {
  
      const joblessRate = d3.interpolate(+prevData.values[0]['失業率'], +data['失業率']);
      const workHours   = d3.interpolate(+prevData.values[0]['平均工時'], +data['平均工時']);
      const salary      = d3.interpolateRound(+prevData.values[0]['平均薪資'], +data['平均薪資']);

      return function(t) {
        jobless.textContent = joblessRate(t).toFixed(2) + '%';
        hours.textContent = workHours(t).toFixed(1);
        price.innerHTML = `${numToCurrency(salary(t))}<small>hr/月</small>`;
      }
    })
}

function initFirstDisplay(data, datas, display) {
  updateBoardDisplay(data, normalizeData(datas));
  showSalaryDetail('', data);
  display.text(`民國 ${data['年份']} 年`);
}


const getTranslate = (translate) => {
  const matches = /\s?(\d+\.*\d+)\,\s?(\d+)/.exec(translate);
  
  return `translate(${+matches[1]}px, ${+matches[2]}px)`;
}

function showSalaryDetail(targetNode, data) {
  const detailTemplate = `
    <div>
      <p class="detail-item salary"><small>平均薪資 </small><strong>${+data["平均薪資"]}</strong></p>
      <p class="detail-item jobless"><small>薪資漲幅 </small><strong>${data["成長幅度"]}</strong></p>
      <p class="detail-item hours"><small>物價指數 </small><strong>${data["物價指數"]}%</strong></p>
    </div>
  `;
  
  
  $('.detail')
    .html(detailTemplate)
    .show()
}

function hideDetail() {
  $('.detail').hide()
}

function responsivefy(svg) {
  const container = d3.select(svg.node().parentNode);

  const width = svg.attr('width');
  const height = svg.attr('height');
  const aspect = width / height;

  const resize = () => {
    const targetWidth = container.attr('width');
    svg
      .attr('width', targetWidth)
      .attr('height', targetWidth / aspect);
  };
  
  svg
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRadio', 'xMinYMid')
    .call(resize);

  d3.select(window).on('resize.' + 'chart', resize);
}

function drawLineChart(err, datas) {
  console.table(datas);
  const margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 80
  };

  const width = window.innerWidth - margin.left - margin.right;
  const height = window.innerHeight - margin.top - margin.bottom;

  const svg = d3.select('#chartArea')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsivefy)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.bottom})`);      
  const xScale = d3
    .scaleLinear()
    .clamp(true)
    .domain([
      60,
      105
    ])
    .range([0, width])
    
  
  const yJoblessScale = d3
    .scaleLinear()
    .domain([
      0,
      8
    ])
    .range([height, 0])
  
  const yScale = d3
    .scaleLinear()
    .clamp(true)
    .domain([
      2000,
      50000
    ])
    .range([
      height,
      0
    ]);
  svg
    .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x axis')
    .call(d3.axisBottom(xScale).ticks(10).tickSize(-height))
  
  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale).ticks(15).tickSize(-width))

  const guideGroup = svg.append('g')
  const guideArea  = guideGroup
    .append('rect')
    .attr('class', 'guide-area')
    .attr('transform', 'translate(0,0)')
    .attr('w', 0)
    .attr('h', 0)
    .attr('fill', '#fff')
    .attr('opacity', 0.5)
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', bindMousemove(xScale, yScale, datas))

  const guideLine = guideGroup
    .append('line')
    .attr('class', 'guide-line')
    .attr('y2', height)
    .attr('stroke-width', 4)
    .attr('stroke', '#000')

  const guideCircle = guideGroup
    .append('circle')
    .attr('class', 'guide-circle')
    .attr('stroke-width', 2)
    .attr('stroke', 'red')
    .attr('fill', '#fff')

  const line = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['平均薪資']));

  const joblessLine = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yJoblessScale(+d['失業率']))
    .curve(d3.curveCatmullRom.alpha(0.5));
  
  const cuurentYearDisplay = svg
    .append('g')
    .attr('class', 'currentYear')
    .attr('transform', `translate(${width - 300}, ${height - 50})`)
    .append('text')
      .attr('font-size', 50)
      .attr('font-family', 'Oswald')
      .attr('style', "fill: #888")

  svg
    .selectAll('.line1')
    .data(datas)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('stroke', '#ff6565')
    .attr('d', d => {
      return line(datas);
    })
    .style('stroke-width', 2)
    .style('fill', 'none')

    initFirstDisplay(datas.slice(-1)[0], datas, cuurentYearDisplay);
};

d3.csv('/salary.csv', drawLineChart);
