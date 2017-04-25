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

export const responsivefy = (svg) => {
  const container = svg.node().parentNode;

  const width = svg.attr('width');
  const height = svg.attr('height');
  const aspect = width / height;

  const resize = () => {
    const targetWidth = container.clientWidth;
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
    .attr('transform', `translate(${margin.left}, ${margin.bottom})`)
}


export function generateAxis(xScale, yScale, label = '', xTicks = 10, yTicks = 15) {
  return (svg, width, height) => {
    svg
      .append('g')
        .attr('transform', `translate(0, ${height})`)
        .attr('class', 'x axis')
      .call(d3.axisBottom(xScale).ticks(xTicks).tickFormat(d3.format('d')).tickSize(10))
    d3.selectAll('.x.axis text')
      .attr('y', 15)
      .style('font-size', '12px')

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
  $('.chart-legend .jobless').text(data['失業率'])
  $('.chart-legend .price-rate').text(data['物價指數'])
  $('.chart-legend .salary-rate').text(data['成長幅度'])
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
    salaryRate: data['成長幅度'].split('%')[0],
  };
  
  const points = d3
    .selectAll('.guide-points')
    .attr('transform', d => {
      const translateY = yScale(values[d.name]);
      return `translate(${Math.round(xScale(targetYear))}, ${translateY})`
    })
    .attr('fill-opacity', 1)
    .attr('stroke-opacity', .5)
    .attr('opacity', 1)
  
  d3
    .selectAll('.guide-line')
    .attr('transform', `translate(${Math.round(xScale(targetYear))}, 0)`)
    .style('stroke-width', '1px')
    .attr('stroke', '#000')
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
    .on('touchend', console.log);

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
      .style('stroke', '#000')
      .style('stroke-opacity', 0)
      .style('fill', '#333')
  
  const groupTexts = guideGroup
    .selectAll('.guide-text')
    .data(points)
    .enter()
    .append('text')
      .attr('y', -20)
      .attr('class','guide-text')
      .attr('text-anchor', 'middle')
      .attr('color', '#333')
      .style('font-size', '14px')
}