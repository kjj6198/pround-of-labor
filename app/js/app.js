import 'main.scss';
import "affix.jquery";
import "./storys";

import { numToCurrency } from './utils';
import { generateSVG, generateAxis, drawGuideArea } from './chartUtils';

const margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 80
};
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

const normalizeData = (datas) => d3.nest().key(d => d["年份"]).entries(datas);
const bindMousemove = (xScale, yScale, datas) => (...args) => {
  const target = args[2][0];
  /* [TODO] if touch device, detect it */
  const [xCoords] = d3.mouse(target);
  const targetYear = Math.round(xScale.invert(xCoords));
  const prevYear = $('#chartArea').attr('data-current-year');

  if (targetYear === prevYear || targetYear < 1973 || targetYear > 2016) { return ; }  
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

  d3.select('.guide-box')
    .attr('transform', `translate(${xCoords}, 0)`)
    .select('text')
    .text(`${targetYear}`)
    

  $('#chartArea').attr('data-current-year', targetYear);
  $('.currentYear > text')[0].textContent = `${targetYear}`;
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
  display.text(`${data['年份']}`);
}


const getTranslate = (translate) => {
  const matches = /\s?(\d+\.*\d+)\,\s?(\d+)/.exec(translate);
  
  return `translate(${+matches[1]}px, ${+matches[2]}px)`;
}

function showSalaryDetail(targetNode, data) {
  const detailTemplate = `
    <div>
      <p class="detail-item salary"><small>平均薪資 </small><strong>${numToCurrency(+data["平均薪資"])}</strong></p>
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
      1971,
      2016
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
    .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')).tickSize(-height))
  
  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale).ticks(15).tickSize(-width))
    .append('text')
    .text('（新台幣）')
    .attr('y', 5)
    .attr('x', 100)
    .style('fill', '#000')
    .style('font-size', '20px')

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
    .on('touchstart', bindMousemove(xScale, yScale, datas))

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
    .attr('fill', '#fff');
  
  const guideBox = guideGroup
    .append('g')
    .attr('class', 'guide-box')

  guideBox.append('text').attr('text-anchor', 'middle')
  
  guideBox
    .append('rect')
    .attr('width', 120)
    .attr('height', 40)
    .attr('fill-opacity', .5)
    .attr('x', -40)
    .attr('y', -32)
    .attr('rx', 2)
    .attr('ry', 2)
  
  guideBox
    .append('polygon')
    .attr('class', 'arrow-polygon')
    .attr('transform', 'translate(-8,0)')
    .attr('points', '8,8 0,0 16,0')
      
  const line = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['平均薪資']));

  const joblessLine = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yJoblessScale(+d['失業率']))
    .curve(d3.curveCatmullRom.alpha(0.5));
  

  svg
    .selectAll('.line1')
    .data(datas)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('stroke', '#ff6565')
    .attr('stroke-width', 5)
    .attr('d', d => {
      return line(datas);
    })
    .style('stroke-width', 5)
    .style('fill', 'none')

    const cuurentYearDisplay = svg
      .append('g')
      .attr('class', 'currentYear')
      .attr('transform', `translate(${width - 300}, ${height - 50})`)
      .append('text')
        .attr('font-size', 200)
        .attr('x', -200)
        .attr('font-family', 'PingFang TC')
        .attr('style', "fill: #aaa")

    initFirstDisplay(datas.slice(-1)[0], datas, cuurentYearDisplay);

};

function drawRalatedLineChart(err, datas) {
  datas = datas.filter(d => +d['年份'] >= 1980);

  const xScale = d3
    .scaleLinear()
    .domain([1980, 2016])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .clamp(true)
    .domain([-5.0, 25.0])
    .range([height, 0]);

  const joblessLine = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['失業率']))
  
  const priceRateLine = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['物價指數']))
  
  const salaryRate = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(+d['年份']))
    .y(d => yScale(d['成長幅度'].split('%')[0]))

  const svg = generateSVG('#relatedChart', window.innerWidth, window.innerHeight);
  generateAxis(xScale, yScale, '（%）', 20, 15)(svg, width, height);
  
  const options = {
    xScale,
    yScale
  }

  svg
    .selectAll('.line.jobless')
    .data(datas)
    .enter()
    .append('path')
    .attr('stroke', '#ff6565')
    .attr('d', d => {
      return joblessLine(datas);
    })
    .style('fill', 'none')

  svg
    .selectAll('.line.priceRateLine')
    .data(datas)
    .enter()
    .append('path')
    .attr('stroke', '#0000ff')
    .attr('stroke-width', 2)
    .attr('d', d => {
      return priceRateLine(datas);
    })
    .style('fill', 'none')

  svg
    .selectAll('.line.salaryRate')
    .data(datas)
    .enter()
    .append('path')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2)
    .attr('d', d => {
      return salaryRate(datas);
    })
    .style('fill', 'none')
    drawGuideArea(width, height, options)(svg, datas);

    svg
      .append('g')
      .attr('class', 'eventArea')
    drawEventRange();
}

d3.csv('./data/salary.csv', (err, datas) => {
  datas = datas.map(d => {
    d['年份'] = (+d['年份'] + 1911).toString();
    return d;
  });

  drawLineChart(err, datas);
  drawRalatedLineChart(err, datas);
  
});
