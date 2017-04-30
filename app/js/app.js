import 'main.scss';
import "waypoints/lib/jquery.waypoints";
import "affix.jquery";
import "./storys";
import "./foreignWorker"
import "./elderRateChart";
import { numToCurrency } from './utils';
import "gallery.js";
import { normalizeData, generateSVG, generateAxis, drawGuideArea, responsivefy, updateBoardDisplay } from './chartUtils';
import { SALARY_URL } from './constants';
import { colors } from './colors';

const margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 80
};
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

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
  const growRate = (+data["成長幅度"].split('%')[0]).toFixed(2);
  const detailTemplate = `
    <div>
      <p class="detail-item salary"><small>平均薪資 </small><strong>${numToCurrency(+data["平均薪資"])}</strong></p>
      <p class="detail-item jobless"><small>薪資漲幅 </small><strong>${growRate}%</strong></p>
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



function drawLineChart(err, datas) {
  const width = (window.innerWidth / 2) - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = generateSVG('#chartArea', width, height);
  const xScale = d3
    .scaleLinear()
    .clamp(true)
    .domain([
      1971,
      2016
    ])
    .range([0, width])
  
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

  const cuurentYearDisplay = svg
    .append('g')
    .attr('class', 'currentYear')
    .attr('transform', `translate(${width - 300}, ${height - 50})`)
    .append('text')
      .attr('font-size', 200)
      .attr('x', -200)
      .attr('font-family', 'PingFang TC')
      .attr('style', "fill: #aaa")

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
    .append('path')
    .attr('class', 'line')
    .attr('stroke', '#ff6565')
    .attr('stroke-width', 5)
    .attr('d', d => {
      return line(datas);
    })
    .style('stroke-width', 5)
    .style('fill', 'none')

   

    initFirstDisplay(datas.slice(-1)[0], datas, cuurentYearDisplay);

};

function drawRalatedLineChart(err, datas) {
  datas = datas.filter(d => +d['年份'] >= 1981);

  const margin = {
          top: 30,
          bottom: 40,
          left: 50,
          right: 50
        },
        width = $('#relatedChart').width() - margin.right - margin.left,
        height = 600 - margin.bottom - margin.top;
  const xScale = d3
    .scaleLinear()
    .domain([1980, 2016])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .clamp(true)
    .domain([-6.0, 18.0])
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
    .curve(d3.curveStepBefore)
    .x(d => xScale(+d['年份']))
    .y(d => yScale(d['成長幅度'].split('%')[0]))

  const svg = generateSVG('#relatedChart', width, height, margin);
  generateAxis(xScale, yScale, '（%）', 20, 15)(svg, width, height);
  
  const options = {
    xScale,
    yScale
  }

  svg
    .append('path')
    .attr('class','jobless')
    .attr('stroke-width', 3)
    .attr('stroke', colors.red)
    .attr('d', d => {
      return joblessLine(datas);
    })
    .style('fill', 'none')

  svg
    .append('path')
    .attr('class','price-rate')
    .attr('stroke', colors.coffee)
    .attr('stroke-width', 3)
    .attr('d', d => {
      return priceRateLine(datas);
    })
    .style('fill', 'none')

  svg
    .append('path')
    .attr('class', 'salary-rate')
    .attr('stroke', colors.blue)
    .attr('stroke-width', 3)
    .attr('d', d => {
      return salaryRate(datas);
    })
    .style('fill', 'none')
    drawGuideArea(width, height, options)(svg, datas);

    svg
      .append('g')
      .attr('class', 'eventArea')
}

d3.csv(SALARY_URL, (err, datas) => {
  datas = datas.map(d => {
    d['年份'] = (+d['年份'] + 1911).toString();
    d['成長幅度'] = d['成長幅度'] * 100 + '%';
    return d;
  });

  drawLineChart(err, datas);
  drawRalatedLineChart(err, datas);

  (function () {
    const $target = $('.story-timeline');
    const $chart = $('#taiwanLaborEnv');
    const unaffix = Math.round($('.js-story-timeline').offset().top + $('.js-story-timeline').height() - window.innerHeight);
    $(window).on('scroll', e => {
      const shouldUnAffix = window.pageYOffset >= unaffix;

      if (shouldUnAffix) {
        $target.removeClass('affix').addClass('unaffix');
        $chart.removeClass('affix').addClass('unaffix');
      } else if(window.pageYOffset <= unaffix && $target.hasClass('unaffix')) {
        $target.removeClass('unaffix').addClass('affix');
        $chart.removeClass('unaffix').addClass('affix');
      }
    });
  })();
});