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
      .call(d3.axisBottom(xScale).ticks(xTicks).tickSize(10))
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
  }
}


export const moveGuideline = (datas, options) => (...args) => {
  const { xScale, yScale } = options;
  const target = args[2][0];
  /* [TODO] if touch device, detect it */
  const [xCoords, yCoords] = d3.mouse(target);

  const targetYear  = Math.round(xScale.invert(xCoords));
  const data = datas.filter(d => d['年份'] === targetYear);
  const values = {
    jobless: 
  }
};

export const drawGuideArea = (width, height, options = {}) => (svg, datas) => {
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
    .on('mousemove', console.log )
    .on('touchend', console.log);

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
      .attr('r', 3)
      .attr('opacity', 0)
      .style('stroke', '#000')
      .style('stroke-opacity', 0)
      .style('fill', '#333')
}