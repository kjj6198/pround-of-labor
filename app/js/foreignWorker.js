import { generateSVG } from './chartUtils';
import { FOREIGN_WORKER_URL } from './constants';


function drawChart(datas) {
  const svg = generateSVG();
}

d3.csv(FOREIGN_WORKER_URL, (err, datas) => {
  drawChart();
})


