import { createSelector } from 'reselect';

const selectCustomersData = (state) => state.customers.customers || [];
const selectCustomersSearchTerm = (state) => state.customers.searchTerm || '';

export const selectFilteredCustomers = createSelector(
  [selectCustomersData, selectCustomersSearchTerm],
  (customers, searchTerm) => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phone?.includes(term)
    );
  }
);

export const selectCustomersByStatus = createSelector(
  [selectCustomersData],
  (customers) => {
    return customers.reduce(
      (acc, customer) => {
        const status = customer.status || 'active';
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(customer);
        return acc;
      },
      {}
    );
  }
);

export const selectCustomersStats = createSelector(
  [selectCustomersData],
  (customers) => {
    return customers.reduce(
      (stats, customer) => {
        stats.totalCustomers += 1;
        stats.totalAmount += customer.account?.totalAmount || 0;
        stats.totalDue += customer.account?.totalDue || 0;
        stats.totalPaid += customer.account?.totalPaid || 0;

        if (customer.status === 'active') {
          stats.activeCustomers += 1;
        }

        return stats;
      },
      {
        totalCustomers: 0,
        activeCustomers: 0,
        totalAmount: 0,
        totalDue: 0,
        totalPaid: 0,
      }
    );
  }
);

