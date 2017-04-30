import "owl.carousel";

const assets = [
  "labor-image.jpg",
  "labor-image2.jpg",
  "labor-image3.jpg",
  "labor-image4.jpg",
];

assets
  .map(img => {
    return `<div class="gallery-image" style="padding-bottom: 100%; background-size:cover;background-image:url(${img})" />`;
  })
  .forEach(img => {
    $('.labor-images-container').append(img);

  })

$('.labor-images-container').owlCarousel({
  loop: true
})