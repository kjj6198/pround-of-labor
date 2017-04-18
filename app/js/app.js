import 'main.scss';


const getTranslate = (translate) => {
  const matches = /\s?(\d+\.*\d+)\,\s?(\d+)/.exec(translate);
  
  return `translate(${+matches[1]}px, ${+matches[2]}px)`;
}
function showSalaryDetail(targetNode, data) {
  const detailTemplate = `
    <ul>
      <li>${+data["平均薪資"]}</li>
      <li>${data["成長幅度"]}</li>
    </ul>
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

function drawLineChart(err, data) {
  console.table(data);
  const margin = {
    top: 10,
    right: 20,
    bottom: 50,
    left: 50
  };

  const width = window.innerWidth - margin.left - margin.right - 30;
  const height = 700 - margin.top - margin.bottom;
  console.log(height)
  const svg = d3.select('.chart')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsivefy)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.bottom})`);
  const xScale = d3
    .scaleLinear()
    .domain([
      62,
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
    .call(d3.axisBottom(xScale).ticks(15))
  
  svg
    .append('g')
    .call(d3.axisLeft(yScale).ticks(15))

  const line = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yScale(+d['平均薪資']));
    // .curve(d3.curveCatmullRom.alpha(0.5))
  const circles = svg
    .selectAll('circle')
    .attr('r', 5)
    .attr('fill', '#aaa')
    
  
  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('g')
      .attr('transform', d => `translate(${xScale(+d['年份'])}, ${yScale(+d['平均薪資'])})`)
        .append('circle')
          .attr('class', 'circle')
          .attr('r', 12)
          .attr('stroke-width', 10)
          .on('mouseover', function(data) {
            this.classList.add('toggle');
            showSalaryDetail(this.parentNode, data);
          })
          .on('mouseleave', function() {
            this.classList.remove('toggle');
            hideDetail();
          });
  
  const joblessLine = d3.line()
    .x(d => xScale(+d['年份']))
    .y(d => yJoblessScale(+d['失業率']))
    .curve(d3.curveCatmullRom.alpha(0.5));
    
  svg
    .selectAll('.line1')
    .data(data)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('stroke', '#aaa')
    .attr('d', d => {
      return line(data);
    })
    .style('stroke-width', 2)
    .style('fill', 'none')

  svg
    .selectAll('.line2')
    .data(data)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('stroke', '#123')
    .attr('d', d => {
      return joblessLine(data);
    })
    .style('stroke-width', 2)
    .style('fill', 'none');
    
}

d3.csv('/salary.csv', drawLineChart);


