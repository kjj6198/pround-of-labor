import 'main.scss';
import "affix.jquery";
import "./storys";

import { numToCurrency } from './utils';

function drawTimeline() {}


function updateBoardDisplay(data, datas) {  
  const jobless = document.querySelector('#jobless > .number');
  const hours   = document.querySelector('#hours > .number');
  const price   = document.querySelector('#price > .number');
  const prevYear = $('#chartArea').attr('data-current-year');

  const [prevData] = datas.filter(d => +d.key === +prevYear);
  if (!prevData) { return ; }
  
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


const getTranslate = (translate) => {
  const matches = /\s?(\d+\.*\d+)\,\s?(\d+)/.exec(translate);
  
  return `translate(${+matches[1]}px, ${+matches[2]}px)`;
}
function showSalaryDetail(targetNode, data) {
  const detailTemplate = `
    <div>
      <p class="detail-item salary"><small>平均薪資 </small><strong>${+data["平均薪資"]}</strong></p>
      <p class="detail-item jobless"><small>薪資成長幅度 </small><strong>${data["成長幅度"]}</strong></p>
      <p class="detail-item hours"><small>物價指數 </small><strong>${data["物價指數"]}%</strong></p>
    </div>
  `;
  
  const translate = getTranslate($(targetNode).attr('transform'));
  
  $('.detail')
    .html(detailTemplate)
    .css('transform', translate)
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
    .domain([
      60,
      105
    ])
    .range([0, width]);
  
  const yJoblessScale = d3
    .scaleLinear()
    .domain([
      0,
      8
    ])
    .range([height, 0])
  
  const yScale = d3
    .scaleLinear()
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
    .call(d3.axisBottom(xScale).ticks(10).tickSize(-height))
  
  svg
    .append('g')
    .call(d3.axisLeft(yScale).ticks(15).tickSize(-width))

  const line = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['平均薪資']));
    // .curve(d3.curveCatmullRom.alpha(0.5))
  const circles = svg
    .selectAll('circle')
    .attr('r', 5)
    .attr('fill', '#aaa')
    
  
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
    .attr('d', d => {
      return line(datas);
    })
    .style('stroke-width', 2)
    .style('fill', 'none')

  // svg
  //   .selectAll('.line2')
  //   .data(data)
  //   .enter()
  //   .append('path')
  //   .attr('class', 'line')
  //   .attr('stroke', '#123')
  //   .attr('d', d => {
  //     return joblessLine(data);
  //   })
  //   .style('stroke-width', 2)
  //   .style('fill', 'none');

     svg
    .selectAll('circle')
    .data(datas)
    .enter()
        .append('circle')
          .attr('cx', d => xScale(+d['年份']))
          .attr('cy', d => yScale(+d['平均薪資']))
          .attr('class', 'circle')
          .attr('r', 8)
          .attr('stroke-width', 2)
          .on('mouseover', function(data) {
            this.classList.add('toggle');
            showSalaryDetail(this.parentNode, data);
            updateBoardDisplay(data, d3.nest().key(d => d["年份"]).entries(datas));
            $('#chartArea').attr('data-current-year', data['年份'])
          })
          .on('mouseleave', function() {
            this.classList.remove('toggle');
            // hideDetail();
          });
};



d3.csv('/salary.csv', drawLineChart);
