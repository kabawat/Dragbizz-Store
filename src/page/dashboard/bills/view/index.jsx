"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { billService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import BillHeader from './components/BillHeader';
import BillSupplierInfo from './components/BillSupplierInfo';
import BillItemsTable from './components/BillItemsTable';
import BillBatches from './components/BillBatches';
import BillNotes from './components/BillNotes';
import BillActions from './components/BillActions';
import DeleteModal from './components/DeleteModal';
import DeleteSuccessModal from './components/DeleteSuccessModal';
import { formatCurrency, formatDate, formatDateTime } from './utils';

const ViewBillPage = ({ billId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedBillNumber, setDeletedBillNumber] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const params = {
          store: storeId,
          id: billId
        };
        const result = await billService.getBills(params);

        if (result.success && result.data) {
          setBillData(result.data);
        } else {
          setError(result.message || 'Failed to fetch bill data');
        }
      } catch (error) {
        setError('Failed to fetch bill data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchBillData();
  }, [billId, storeId]);

  const handleEditBill = () => {
    router.push(`/dashboard/bills/${billId}/edit`);
  };

  const handleMakePayment = () => {
  };

  const handlePaymentCompleted = () => {
  };

  const handleDeleteBill = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!billId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await billService.deleteBill(billId, storeId);

      if (result.success) {
        setDeletedBillNumber(billData?.billNumber || 'Bill');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete bill');
        setShowDeleteModal(false);
      }
    } catch (error) {
      setError('Failed to delete bill. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push('/dashboard/bills');
  };

  if (fetching) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header
          title="View Bill"
          description="Bill information and details"
        />
        <div className="flex-1 p-6">
          <div className="">
            <div className="mb-6">
              <Link href="/dashboard/bills" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Bills</span>
              </Link>
            </div>

            {error && <ErrorState error={error} />}

            {!error && billData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col space-y-6">
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                    <BillHeader billData={billData} formatDate={formatDate} />
                    <BillSupplierInfo supplier={billData.supplier} />
                  </div>

                  <BillItemsTable 
                    items={billData.items} 
                    itemsSummary={billData.itemsSummary}
                    formatCurrency={formatCurrency}
                  />

                  <BillBatches 
                    batches={billData.batches} 
                    formatCurrency={formatCurrency}
                  />

                  <BillNotes notes={billData.notes} />
                </div>

                <BillActions
                  billData={billData}
                  onMakePayment={handleMakePayment}
                  onPaymentCompleted={handlePaymentCompleted}
                  onEditBill={handleEditBill}
                  onDeleteBill={handleDeleteBill}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        billNumber={billData?.billNumber}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        billNumber={deletedBillNumber}
        onClose={handleDeleteSuccess}
      />
    </div>
  );
};

export default ViewBillPage;
