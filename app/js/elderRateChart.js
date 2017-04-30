import { formatNumber } from './utils';
import { generateSVG, generateAxis } from './chartUtils';
import { POPULATION_URL } from './constants';
import { pipe } from 'ramda';
import { getDevice } from './media';




function drawChart(datas) {
  // debugger;
  const groupByYearData = d3.nest().key(d => d['年份']).entries(datas).map(d => {
    d.values = d3
      .entries(d.values[0])
      .filter(d => d.key.indexOf('歲') !== -1 || d.key.indexOf('年份') !== -1)
      .map(d => {
        d.value = +d.value || 0
        return d;
      })
    return d;
  });

  const cols = datas.columns.filter(d => d.indexOf('歲') > -1);

  const margin =  {
    top: 80,
    bottom: 40,
    right: getDevice('desktop') ? 40 : 20,
    left: getDevice('desktop') ? 50 : 50,
  };

  const width = window.innerWidth - margin.left - margin.right;
  const height = getDevice('desktop') ? 500 - margin.bottom - margin.top : 300 - margin.bottom - margin.top;
  

  const svg = generateSVG('#elderChart', width, height, margin);

  const xScale = d3
    .scaleBand()
    .padding(0.45)
    .domain(datas.columns.filter(d => d.indexOf('歲') > -1).map(d => d.split('歲')[0]))
    .range([0, width])

  const yScale = d3
    .scaleLinear()
    .domain([0, 2200])
    .range([height, 0]);

  svg
    .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x axis')
    .call(d3.axisBottom(xScale).ticks(20).tickSize(10))
    .append('text')
    .attr('dx', 4)
    .attr('x', width + 10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('fill', '#111')
    .style('font-weight', 'bold')
    .text('(歲)')

  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale).ticks(10).tickSize(-width))
    .append('text')
    .attr('dx', 4)
    .attr('y', 6)
    .attr('text-anchor', 'start')
    .style('fill', '#111')
    .style('font-weight', 'bold')
    .text('(仟人)')
  
  
  const barArea = svg.append('g')
    .attr('class', 'barArea')

  const tooltip = svg
    .append('g')
    .attr('class', 'tooltip')
    .attr('opacity', 0)

  const toolRect = tooltip
    .append('rect')
    .attr('stroke-width', 3)
    .attr('stroke', '#111')
    .attr('fill', '#fff')
    .attr('rx', 5)
    .attr('ry', 5);
  const toolTri = tooltip
    .append('polygon')
    .attr('fill', '#fff')
    .attr('stroke', '#111')
    .attr('stroke-width', 3)
    .attr('points', '0,0 4,4 8,0')

  const tooltipText = tooltip
    .append('text')
    .attr('class', 'tooltip-text')
    .attr('text-anchor', 'middle')

  tooltipText
    .append('tspan')
    .attr('class', 'key')
    .attr('x', 0)
    .attr('dy', '1.4em')

  tooltipText
    .append('tspan')
    .attr('class', 'value')
    .attr('x', 0)
    .attr('dy', '1.4em')
  
    
  barArea
    .selectAll('rect')
    .data(groupByYearData[0].values)
    .enter()
    .append('rect')
      .attr('class', d => {
        const [ages] = d.key.split('歲')[0].split('~');

        if (+ages < 15) {
          return 'color-1';
        } else if (+ages >= 15 && +ages < 65) {
          return 'color-2';
        } else if (+ages >= 65) {
          return 'color-6';
        }
      })
      .attr('x', d => xScale(d.key.split('歲')[0]))
      .attr('y', d => yScale(d.value / 1000))
      .attr('height', d => height - yScale(d.value / 1000))
      .attr('width', d => xScale.bandwidth())
      .on('mousemove', function(data) {
        const [x, y] = d3.mouse(this);

        tooltip
          .selectAll('.key')
          .text(`年齡層： ${data.key}`)

        tooltip
          .selectAll('.value')
          .text(`人口數：${formatNumber(data.value)}`)

        const bbox = tooltipText.node().getBBox();

        toolRect
          .attr('width', bbox.width + 20)
          .attr('height', bbox.height + 20)
          .attr('x', `-${(bbox.width + 20) / 2}`)

        tooltip
          .attr('opacity', 1)
          .attr('transform', `translate(${x}, ${yScale(data.value / 1000) - (bbox.height + 45)})`)

        toolTri.attr('transform', `translate(0, ${bbox.height + 20})`)
      })
      // .on('mouseout')

  $('.topic-title.issue-3').waypoint({
    offset: '25%',
    handler: function() {
      this.destroy();
      const animation = setInterval((() => {
        let currentYear = 1974;
        return () => {
          render(currentYear);
          currentYear++;

          if (currentYear === 2016) {
            clearInterval(animation);
          }
        }
      })(), 500);
    }
  })

  function render(currentYear = 1974) {
    const t = d3.transition().duration(500);
    const data = groupByYearData.filter(d => +d.key === currentYear)[0].values;
    const update = svg.selectAll('g.barArea > rect').data(data);
    const sum = d3.sum(data, d => d.key === '年份' ? 0 : d.value);
    const sumElder = d3.sum(data, d => (d.key !== '年份' && +d.key.split('歲')[0].split('~')[0] >= 65) ? d.value : 0);

    update.transition(t)
      .delay(100)
      .attr('y', d => yScale(d.value / 1000))
      .attr('height', d => height - yScale(d.value / 1000));


    $('#displayYear').text(currentYear);
    $('#displayElder').text(((sumElder / sum) * 100).toFixed(2) + '%');

    d3
      .select('#displayRate')
      .transition()
      .tween('number', () => {
        const rate = d3.interpolate($('#displayRate').text().replace(/,/g,''), sum);
        
        return function(t) {
          $('#displayRate').text(
            pipe(
              rate,
              parseInt,
              formatNumber
            )(t)
          );
        }
      })
    
  }
}

d3.csv('./data/population.csv', (err, datas) => {
  drawChart(datas);
});