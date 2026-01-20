import moment from 'moment';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date) => {
  return moment(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date) => {
  return moment(date).format('MMM DD, YYYY h:mm A');
};

