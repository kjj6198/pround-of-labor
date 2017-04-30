import { generateSVG, generateAxis } from './chartUtils';
import { FOREIGN_WORKER_URL } from './constants';

import { formatNumber } from './utils';
import { getDevice } from './media';

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
  
  function handleMouse(direction) {

    if (direction === 'in') {

      const tooltipBox = d3.selectAll('.tooltip.foreign');

      const tooltipRect = tooltipBox.append('rect')
        .attr('width', 80)
        .attr('height', 30)
        .attr('fill', '#777')
        .attr('fill-opacity', .8);

      const tooltipText = tooltipBox
        .append('text') 
        .attr('text-anchor', 'start')
        .attr('class', 'tooltip-text')
        .attr('fill', '#fff')

      const tooltipKey = tooltipText
        .append('tspan')
        .attr('class', 'text-key')
        .attr('x', 10)
        .attr('dy', '1.15em')
        
      const tooltipVal = tooltipText
        .append('tspan')
        .attr('class', 'text-value')
        .attr('fill', '#fff')
        .attr('dy', '1.15em')
        .attr('x', 10)

      
      return function(data) {
        const country = this.parentNode.getAttribute('data-name') || '';
        const [xx, yy] = d3.mouse(this);

        tooltipKey.text(`${country} ${formatNumber(+data.data[country])}`)


        tooltipVal.text(`總計：${formatNumber(+data.data['總計'])}`)

        const bbox = tooltipText.node().getBBox();
        const { width, height } = bbox;

        tooltipBox
          .attr('opacity', 1)
          .attr('transform', `translate(${xx - 15}, ${yy - (height + 40)})`);
        
        tooltipRect
          .attr('width', width + 20)
          .attr('height', height + 20)
      }

    } else {
      return function() {
        d3.select('.tooltip').attr('opacity', 0);
      }
    }


  }

  const t = d3
    .transition()
    .duration(500);

  const tooltipBox = svg
        .append('g')
        .attr('class', 'tooltip foreign')
        .attr('opacity', 0);

  
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
      .attr('data-name', d => d.key);

  const bar = group.selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
      .attr('x', d => xScale(d.data['年份']))
      // .attr('y', d => height)
      .attr('height', 0)
      .attr('width', d => xScale.bandwidth())
      .on('mousemove', handleMouse('in'))
      .on('mouseleave', handleMouse('out'))
      .transition(t)
      .delay(300)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
    
    
    
}

function drawChartByYear(year) {

}

function drawChart(datas) {
  const width = window.innerWidth;
  const height = getDevice('desktop') ? 400 : 500;

  const svg = generateSVG('#workerChart', width, height, {
    top: 10,
    bottom: getDevice('desktop') ? 50 : 30,
    right: getDevice('desktop') ? 90 : 10,
    left: getDevice('desktop') ? 90 : 70
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

  const guidelineArea = svg
        .append('rect')
        .attr('w', 0)
        .attr('h', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
         

  generateAxis(xScale, yScale, '', 10, 5)(svg, width, height);

  const chart = new Chart(xScale, yScale, datas, svg);
  
  drawBarChart(chart);
}

d3.csv('./data/foreign_worker.csv', (err, datas) => {
  $('.topic-title.issue-2').waypoint({
      handler: function(direction) {
        drawChart(datas);
        this.destroy();
      },
      triggerOnce: true
  },
  )
})


