import "owl.carousel";
import { scrollToTarget } from './utils';

const assets = [
  {
    text: '台灣勞工事件簿',
    image: './img/labor-image.jpg',
    id: 'laborEvents',
  },
  {
    text: '工作環境比較',
    image: './img/labor-image2.jpg',
    id: 'laborEnv',
  },
  {
    text: '高齡化社會',
    image: './img/labor-image4.jpg',
    id: 'elder',
  },
  {
    text: '外籍勞工人口破 60 萬',
    image: './img/labor-image5.jpg',  
    id: 'foreignWorker',
  }
];

assets
  .map(img => {
    return `
    <div class="gallery-image" data-target="${img.id}" style="background-image:url(${img.image})">
      <h3 class="gallery-title">${img.text}</h3>
    </div>
    `;
  })
  .forEach(img => {
    $('.labor-images__content').append(img);

  })

$('.labor-images__content').owlCarousel({
  loop: true,
  autoplay: true,
  autoplayTimeout: 5000,
  autoplayHoverPause: true,
  responsive: {
    0: {
      items: 1.5,
      margin: 8,
      stagePadding: 0
    },
    960: {
      items: 2,
      margin: 8,
      stagePadding: 16
    },
    1200: {
      items: 4,
      margin: 8,
      stagePadding: 16
    } 

  }
}).on('click', '.gallery-image', e => {
  const $target = $('#' + $(e.currentTarget).data('target'));
  $(e.target).data('target');
  scrollToTarget($target);
});