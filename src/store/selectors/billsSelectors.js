import { createSelector } from 'reselect';

const selectBillsState = (state) => state.bills;
const selectBillsData = (state) => state.bills.bills || [];
const selectBillsFilter = (state) => state.bills.currentFilter;

export const selectFilteredBills = createSelector(
  [selectBillsData, selectBillsFilter],
  (bills, filter) => {
    if (filter === 'all') return bills;
    if (filter === 'pending') {
      return bills.filter(
        (bill) => bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIAL'
      );
    }
    if (filter === 'overdue') {
      const today = new Date();
      return bills.filter(
        (bill) =>
          new Date(bill.dueDate) < today &&
          (bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIAL')
      );
    }
    return bills;
  }
);

export const selectBillsByStatus = createSelector(
  [selectBillsData],
  (bills) => {
    return bills.reduce(
      (acc, bill) => {
        const status = bill.paymentStatus || 'UNPAID';
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(bill);
        return acc;
      },
      {}
    );
  }
);

export const selectBillsStats = createSelector(
  [selectBillsData],
  (bills) => {
    const today = new Date();
    return bills.reduce(
      (stats, bill) => {
        stats.totalBills += 1;
        stats.totalAmount += bill.totalAmount || 0;
        stats.paidAmount += bill.paidAmount || 0;
        stats.dueAmount += bill.dueAmount || 0;

        if (bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIAL') {
          stats.pendingBills += 1;
        }

        if (
          new Date(bill.dueDate) < today &&
          (bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIAL')
        ) {
          stats.overdueBills += 1;
        }

        return stats;
      },
      {
        totalBills: 0,
        pendingBills: 0,
        overdueBills: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
      }
    );
  }
);

