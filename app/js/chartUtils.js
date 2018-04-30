import { numToCurrency } from 'utils';

export const createCommentArea = (text, potision, options = { class: 'comment' }) => (svg) => {
  const comment = svg
    .append('g')
    .attr('class', options.class)
    .classed('comment-area', true);
  comment.append('text')
    .attr('transform', `translate(${options.xScale})`)
    .attr('x', 0)
    .attr('y', -25)
    .attr('text-anchor', 'middle')
    .text()
}

export const normalizeData = (datas) => d3.nest().key(d => d["年份"]).entries(datas);

export function initBoardDisplay(data) {
  const jobless = document.querySelector('#jobless > .number');
  const hours   = document.querySelector('#hours > .number');
  const price   = document.querySelector('#price > .number');
  const medium   = document.querySelector('#medium > .number');

  jobless.textContent = parseFloat(data['失業率'], 10) || '無資料';
  hours.innerHTML = `${parseInt(data['平均工時'])}<small>hr/月</small>`;
  price.innerHTML = `${numToCurrency(data['平均薪資'])}`;
  medium.textContent = `${parseInt(data['薪資中位數'], 10) || '無資料'}`;
}

export function updateBoardDisplay(data, datas) {  
  const jobless = document.querySelector('#jobless > .number');
  const hours   = document.querySelector('#hours > .number');
  const price   = document.querySelector('#price > .number');
  const medium   = document.querySelector('#medium > .number');
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
      const mediumSalary      = d3.interpolateRound(+prevData.values[0]['薪資中位數'], +data['薪資中位數']);
      return function(t) {
        jobless.textContent = joblessRate(t).toFixed(2) + '%';
        hours.innerHTML = `${workHours(t).toFixed(1)}<small>hr/月</small>`;
        price.innerHTML = `${numToCurrency(salary(t))}`;
        medium.textContent = `${numToCurrency(mediumSalary(t))}`
      }
    })
}


export function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;
      
  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}

export const calcWH = (w, h, margin) => {
  return {
    w: w - margin.left - margin.right,
    h: h - margin.bottom - margin.top
  }
}

export const generateSVG = (target, width, height, margin = {
  top: 10,
  bottom: 10,
  left: 30,
  right: 10
}) => {
  return d3
    .select(target)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsivefy)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
}


export function generateAxis(xScale, yScale, label = '', xTicks = 10, yTicks = 15) {
  return (svg, width, height) => {
    svg
      .append('g')
        .attr('transform', `translate(0, ${height})`)
        .attr('class', 'x axis')
      .call(d3.axisBottom(xScale).ticks(xTicks).tickFormat(d3.format('d')).tickSize(10))
    svg.selectAll('.x.axis text')
      .attr('y', 15)

    svg
      .append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yScale).ticks(yTicks).tickSize(-width))
      .append('text')
          .attr('dx', 4)
          .attr('y', 6)
          .attr('text-anchor', 'start')
          .text(label)
          .style('fill', '#111')
          .style('font-size', '20px')
          .style('font-weight', 'bold')
  }
}

export const drawDisplayBoard = (data) => {
  const growRate = (+data["成長幅度"].split('%')[0]).toFixed(2) + '%';
  $('.chart-legend .jobless').text(data['失業率'])
  $('.chart-legend .price-rate').text(data['物價指數'])
  $('.chart-legend .salary-rate').text(growRate)
}

export const moveGuideline = (datas, options) => (...args) => {
  const { xScale, yScale } = options;
  const target = args[2][0];
  /* [TODO] if touch device, detect it */
  const [xCoords, yCoords] = d3.mouse(target);

  const targetYear  = Math.round(xScale.invert(xCoords));
  const [data] = datas.filter(d => +d['年份'] === +targetYear);

  const values = {
    jobless: data['失業率'],
    priceRate: data['物價指數'],
    salaryRate: (+data["成長幅度"].split('%')[0]).toFixed(2),
  };
  
  const points = d3
    .selectAll('.guide-points')
    .attr('transform', d => {
      const translateY = yScale(values[d.name]);
      return `translate(${Math.round(xScale(targetYear))}, ${translateY})`
    })
    .attr('opacity', 1)
  
  d3
    .selectAll('.guide-line')
    .attr('transform', `translate(${Math.round(xScale(targetYear))}, 0)`)
    .style('stroke-width', '1px')
    .attr('stroke', '#333')
    .style('shape-rendering', 'crispEdges')

  d3.selectAll('.guide-text')
    .attr('transform', d => `translate(${xScale(targetYear)},${yScale(values[d.name])})`)
    .text(d => `${d.value}:${data[d.value]}`)
  
  drawDisplayBoard(data);

};

export const drawGuideArea = (width, height, options = {}) => (svg, datas) => {
  const {xScale, yScale} = options;
  const guideGroup = svg.append('g').attr('opacity', 1);
  const guideArea = guideGroup
    .append('rect')
    .attr('class', 'guide-area')
    .attr('transform', 'translate(0,0)')
    .attr('opacity', 0)
    .attr('w', 0)
    .attr('h', 0)
    .attr('fill', '#fff')
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', moveGuideline(datas, { xScale, yScale }))
    .on('touchmove', moveGuideline(datas, { xScale, yScale }));

  const guideLine = guideGroup.append('line')
    .attr('class', 'guide-line')
    .attr('x0', 0)
    .attr('x1', 0)
    .attr('y0', 0)
    .attr('y1', height);

  const points = [
    {
      name: 'jobless',
      value: '失業率'
    },
    {
      name: 'salaryRate',
      value: '成長幅度'
    },
    {
      name: 'priceRate',
      value: '物價指數'
    }
  ]

  const guidePoints = guideGroup
    .selectAll('.guide-points')
    .data(points)
    .enter()
    .append('circle')
      .attr('class', d => `guide-points ${d.name}`)
      .attr('r', 5)
      .attr('opacity', 0)
      
  
  const groupTexts = guideGroup
    .selectAll('.guide-text')
    .data(points)
    .enter()
    .append('text')
      .attr('y', -20)
      .attr('class','guide-text')
      .attr('text-anchor', 'middle')
      .attr('color', '#333')
}