import { simpleFormat } from './utils';
import { EVENTS_URL, PRESIDENT_URL } from './constants';
import { normalizeData } from './chartUtils';


function scrollToTarget(target) {
  $('html, body').animate({
    scrollTop: target.offset().top
  }, 1000, function() {    
    var $target = $(target);
    $target.focus();
    if ($target.is(":focus")) { // Checking if the target was focused
      return false;
    } else {
      $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
      $target.focus(); // Set focus again
    };
  });
  $(target).offset().top
}

function strToEls(str) {
  const contextRange = document.createRange();
  contextRange.setStart(document.body, 0);

  return contextRange.createContextualFragment(str);
}


function drawStoryTimeline(datas) {
  const yearSet = d3.set(datas.map(d => d['Year']));
  
  $('#storyTimeline').html(yearSet.values().map(y => `
    <p style="text-align:center;font-weight:bold;">
      ${y}
    </p>
  `).join(''));
}

const storyTemplate = ({time, title, description, image_url, caption}) => {  

  if (image_url) {
    
    return `
      <div class="story">
        <time class="story-time" id="${time}">
          ${time}
        </time>
        <h4 class="story-title">${title}</h4>
        <p class="story-content">
          ${simpleFormat(description)}
        </p>
        <figure>
          <img class="story-image" src="${image_url}" />
          <figcaption>${caption}</figcaption>
        </figure>

      </div>
    `
  } else {
    return `
      <div class="story">
        <time class="story-time" id="${time}">
          ${time}
        </time>
        <h4 class="story-title">${title}</h4>
        <p class="story-content">
          ${simpleFormat(description)}
        </p>
      </div>
    `
  }

  
};

function drawEvents(events, presidentData) {
  const $storyArea = $('.js-story-timeline');
  events.map(event => {
    const story = strToEls(storyTemplate({
      time: `${event['Year']} / ${event['Month']} / ${event['Date']} `,
      description: event['Description'],
      title: event['Title'],
      image_url: event['Image_url'] || null,
      caption: event['caption']
    }))
    $storyArea.append(story);
  });

  $(document).on('click', '#storyTimeline', e=> {
    const $target = $('.js-story-timeline').find(`[id^="${e.target.textContent.trim()}"]`).first();
    scrollToTarget($target);
  })

}


d3.queue()
  .defer(d3.csv, './data/events.csv')
  .defer(d3.csv, './data/president.csv')
  .await((err, eventData, presidentData) => {
    drawEvents(eventData, presidentData);
    drawStoryTimeline(eventData);
  })
