import { simpleFormat } from './utils';

const contextRange = document.createRange();
contextRange.setStart(document.body, 0);

function strToEls(str) {
  return contextRange.createContextualFragment(str);
}

function drawStoryTimeline(datas) {
  $('#storyTimeline').html(datas.map(d => `
    <p style="text-align:center;font-weight:bold;">
      ${d['Year']}.${d['Month']}
    </p>
  `).join(''));
}

const storyTemplate = ({time, title, description, image_url}) => {  
  return `
    <div class="story">
      <time class="story-time">${time}</time>
      <h4 class="story-title">${title}</h4>
      <p class="story-content">
        ${simpleFormat(description)}
      </p>
      <img class="story-image" src="${image_url}" />
    </div>
  `
};

function drawEvents(events) {
  const $storyArea = $('.js-story-timeline');
  events.map(event => {
    const story = strToEls(storyTemplate({
      time: `${event['Year']} / ${event['Month']} / ${event['Date']} `,
      description: event['Description'],
      title: event['Title'],
      image_url: event['Image_url']
    }))
    $storyArea.append(story);
  });
}




d3.csv('/events.csv', (error, datas) => {
  drawEvents(datas);
  drawStoryTimeline(datas);
});