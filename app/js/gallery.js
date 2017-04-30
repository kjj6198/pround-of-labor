import "owl.carousel";

const assets = [
  './img/labor-image.jpg',
  './img/labor-image2.jpg',
  './img/labor-image3.jpg',
  './img/labor-image4.jpg',
  './img/labor-image5.jpg',
];

assets
  .map(img => {
    return `<div class="gallery-image" style="background-image:url(${img})" />`;
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
})