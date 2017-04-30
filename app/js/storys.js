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
  
  console.log(yearSet.values())

  $('#storyTimeline').html(yearSet.values().map(y => `
    <p style="text-align:center;font-weight:bold;">
      ${y}
    </p>
  `).join(''));
}

const storyTemplate = ({time, title, description, image_url, caption}) => {  
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
};

function drawEvents(events) {
  const $storyArea = $('.js-story-timeline');
  events.map(event => {
    const story = strToEls(storyTemplate({
      time: `${event['Year']} / ${event['Month']} / ${event['Date']} `,
      description: event['Description'],
      title: event['Title'],
      image_url: event['Image_url'],
      caption: event['caption']
    }))
    $storyArea.append(story);
  });

  $(document).on('click', '#storyTimeline', e=> {
    const $target = $('.js-story-timeline').find(`[id^="${e.target.textContent.trim()}"]`).first();
    // debugger
    scrollToTarget($target);    

  })
}



d3.queue()
  .defer(d3.csv, EVENTS_URL)
  .defer(d3.csv, PRESIDENT_URL)
  .await((err, eventData, presidentData) => {
    drawEvents(eventData);
    drawStoryTimeline(eventData);

    (function () {
      const $target = $('.story-timeline');
      const $chart = $('#taiwanLaborEnv');
      const unaffix = Math.round($('.js-story-timeline').offset().top + $('.js-story-timeline').height() + window.innerHeight * 2 + window.innerHeight / 2);
      $(window).on('scroll', e => {
        const shouldUnAffix = window.pageYOffset >= unaffix;

        if (shouldUnAffix) {
          $target.removeClass('affix').addClass('unaffix');
          $chart.removeClass('affix').addClass('unaffix');
        } else if(window.pageYOffset <= unaffix && $target.hasClass('unaffix')) {
          $target.removeClass('unaffix').addClass('affix');
          $chart.removeClass('unaffix').addClass('affix');
        }
      });
    })();
  })
