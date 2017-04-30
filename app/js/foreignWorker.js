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
  
  function handleMouse(direction) {

    if (direction === 'in') {

      const tooltipBox = svg
        .append('g')
        .attr('class', 'tooltip')
        .attr('opacity', 0)
      
      const tooltipRect = tooltipBox.append('rect')
        .attr('width', 80)
        .attr('height', 30)
        .attr('fill', '#777')
        .attr('fill-opacity', .8);

      const tooltipText = tooltipBox
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('class', 'tooltip-text')
        .attr('fill', '#fff')

      
      return function(data) {
        const country = this.parentNode.getAttribute('data-name') || '';
        const [xx, yy] = d3.mouse(this);

        tooltipText
          .text(`${country} ${data.data[country]}
            總計：${data.data['總計']}
          `);

        const bbox = tooltipText.node().getBBox();
        const { width, height } = bbox;

        tooltipBox
          .attr('opacity', 1)
          .attr('transform', `translate(${xx - 15}, ${yy - height})`);
        
        tooltipRect
          .attr('width', width + 20)
          .attr('height', height + 10)
          .attr('x', -(width + 20) / 2)
          .attr('y', -(height + 20) / 2)

      }

    } else {
      return function() {
        d3.select('.tooltip').attr('opacity', 0);
      }
    }


  }

  
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
      .attr('data-name', d => d.key)
    .selectAll('rect')
    .data(d => d).enter()
    .append('rect')
      .attr('x', d => xScale(d.data['年份']))
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width', d => xScale.bandwidth())
    .on('mousemove', handleMouse('in'))
    .on('mouseleave', handleMouse('out'))
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

d3.csv(FOREIGN_WORKER_URL, (err, datas) => {
  $('.topic-title.issue-1').waypoint({
      handler: function(direction) {
        if (direction === 'up') {
          drawChart(datas);
        }

        this.destroy();
      }
  })
})


