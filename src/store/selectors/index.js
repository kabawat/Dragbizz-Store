import { createSelector } from "reselect";

const selectProfileState = (state) => state.profile;
const selectBillsState = (state) => state.bills;
const selectCustomersState = (state) => state.customers;
const selectSuppliersState = (state) => state.suppliers;
const selectProductsState = (state) => state.products;
const selectInvoicesState = (state) => state.invoices;
const selectPaymentsState = (state) => state.payments;
const selectExpensesState = (state) => state.expenses;
const selectPurchaseOrdersState = (state) => state.purchaseOrders;

export const selectProfile = createSelector(
  [selectProfileState],
  (profile) => profile
);

export const selectUser = createSelector(
  [selectProfileState],
  (profile) => profile.user
);

export const selectAgency = createSelector(
  [selectProfileState],
  (profile) => profile.agency
);

export const selectStores = createSelector(
  [selectProfileState],
  (profile) => profile.stores || []
);

export const selectSelectedStore = createSelector(
  [selectProfileState],
  (profile) => profile.selectedStore
);

export const selectIsAuthenticated = createSelector(
  [selectProfileState],
  (profile) => profile.isAuthenticated
);

export const selectProfileLoading = createSelector(
  [selectProfileState],
  (profile) => profile.isLoading
);

export const selectBills = createSelector(
  [selectBillsState],
  (bills) => bills.bills || []
);

export const selectBillsLoading = createSelector(
  [selectBillsState],
  (bills) => bills.isLoading
);

export const selectBillsPagination = createSelector(
  [selectBillsState],
  (bills) => bills.pagination || {}
);

export const selectBillsStats = createSelector(
  [selectBillsState],
  (bills) => bills.stats || {}
);

export const selectBillsAnalytics = createSelector(
  [selectBillsState],
  (bills) => bills.analytics || {}
);

export const selectBillsFilter = createSelector(
  [selectBillsState],
  (bills) => bills.currentFilter
);

export const selectCustomers = createSelector(
  [selectCustomersState],
  (customers) => customers.customers || []
);

export const selectCustomersLoading = createSelector(
  [selectCustomersState],
  (customers) => customers.isLoading
);

export const selectCustomersPagination = createSelector(
  [selectCustomersState],
  (customers) => customers.pagination || {}
);

export const selectCustomersAnalytics = createSelector(
  [selectCustomersState],
  (customers) => customers.analytics || {}
);

export const selectSuppliers = createSelector(
  [selectSuppliersState],
  (suppliers) => suppliers.suppliers || []
);

export const selectSuppliersLoading = createSelector(
  [selectSuppliersState],
  (suppliers) => suppliers.isLoading
);

export const selectProducts = createSelector(
  [selectProductsState],
  (products) => products.products || []
);

export const selectProductsLoading = createSelector(
  [selectProductsState],
  (products) => products.isLoading
);

export const selectInvoices = createSelector(
  [selectInvoicesState],
  (invoices) => invoices.invoices || []
);

export const selectInvoicesLoading = createSelector(
  [selectInvoicesState],
  (invoices) => invoices.isLoading
);

export const selectPayments = createSelector(
  [selectPaymentsState],
  (payments) => payments.payments || []
);

export const selectPaymentsLoading = createSelector(
  [selectPaymentsState],
  (payments) => payments.isLoading
);

export const selectExpenses = createSelector(
  [selectExpensesState],
  (expenses) => expenses.expenses || []
);

export const selectExpensesLoading = createSelector(
  [selectExpensesState],
  (expenses) => expenses.isLoading
);

export const selectPurchaseOrders = createSelector(
  [selectPurchaseOrdersState],
  (purchaseOrders) => purchaseOrders.list || []
);

export const selectPurchaseOrdersLoading = createSelector(
  [selectPurchaseOrdersState],
  (purchaseOrders) => purchaseOrders.isLoading
);

export const selectPurchaseOrdersPagination = createSelector(
  [selectPurchaseOrdersState],
  (purchaseOrders) => purchaseOrders.pagination || {}
);
