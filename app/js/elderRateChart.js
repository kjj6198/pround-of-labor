import { generateSVG, generateAxis } from './chartUtils';
import { POPULATION_URL } from './constants';


function drawChart(datas) {
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
    top: 10,
    bottom: 50,
    right: 40,
    left: 100
  };

  const width = 1600 - margin.left - margin.right;
  const height = 900 - margin.bottom - margin.top;
  

  const svg = generateSVG('#elderChart', width, height, margin);

  const xScale = d3
    .scaleBand()
    .padding(0.45)
    .domain(datas.columns.filter(d => d.indexOf('歲') > -1).map(d => d.split('歲')[0]))
    .range([0, width])

  const yScale = d3
    .scaleLinear()
    .domain([0, 2200000])
    .range([height, 0]);

  svg
    .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x axis')
    .call(d3.axisBottom(xScale).ticks(20).tickSize(10))

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
  
  
  svg
    .selectAll('rect')
    .data(groupByYearData[0].values)
    .enter()
    .append('rect')
      .attr('x', d => xScale(d.key.split('歲')[0]))
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('width', d => xScale.bandwidth())

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

  function render(currentYear = 1974) {
    const t = d3.transition().duration(500);
    const update = svg.selectAll('rect')
      .data(groupByYearData.filter(d => +d.key === currentYear)[0].values);


    update.transition(t)
      .delay(100)
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))

  }
}

d3.csv(POPULATION_URL, (err, datas) => {
  drawChart(datas);
});