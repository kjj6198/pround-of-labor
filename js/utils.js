import { compose, prop } from 'ramda';


export function scrollToTarget(target) {
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

export const formatNumber = (num) => {
  const numberString = num.toString()
  const numberParts = numberString.split('.')
  const n = numberParts[0] + (numberParts[1] ? '.' + numberParts[1].slice(0,2) : '')

  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const numToCurrency = (number, options = {
  locale: 'twd',
}) => {
  const locale = prop('locale')(options);
  const currency = {
    TWD: '$',
    USD: '$',
    JPY: '¥',
    CAD: '$',
  };
  const getCurrency = (num) => prop(locale.toUpperCase())(currency) + num;

  return compose(
    getCurrency,
    formatNumber,
  )(number);
}

export const simpleFormat = (str) => {
  return str.split('\n')
    .map(line => `${line}<br/>`)
    .join('');
}