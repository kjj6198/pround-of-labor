import { compose, prop } from 'ramda';

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