"use client";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CustomerForm } from "@/components/customer";
import { Button } from "@/components/ui";
import { useGstVerification } from "@/hooks/useGstVerification";
import { useTranslation } from "@/hooks/useTranslation";
import { useCommonHotkeys } from "@/hooks/useCommonHotkeys";
import { useGlobalToast } from "@/contexts/ToastContext";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const LoadingState = ({ t }) => (
  <div className="flex w-full h-screen relative overflow-hidden">
    <Sidebar />
    <div className="min-h-screen w-full flex flex-col">
      <Header title={t("customers.editCustomer")} description={t("customers.editCustomerDescription")} />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
        </div>
      </div>
    </div>
  </div>
);

const EditCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showSuccess, showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    store: storeId,
    name: "",
    phone: "",
    email: "",
    address: "",
    companyDetails: { gstin: "", companyName: "", gstDetail: "" },
    addresses: null,
  });

  const gstVerification = useGstVerification({
    onNameAutoFill: (name) => setFormData((prev) => ({ ...prev, companyDetails: { ...prev.companyDetails, companyName: name } })),
    ongstDetailChange: (id) => setFormData((prev) => ({ ...prev, companyDetails: { ...prev.companyDetails, gstDetail: id } })),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [_error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !storeId || hasFetched.current) return;
      hasFetched.current = true;
      try {
        setFetching(true);
        const result = await customerService.getCustomers({ id: customerId, store: storeId });
        if (result.success && result.data) {
          const d = result.data;
          setFormData({
            store: storeId,
            name: d.name || "",
            phone: d.phone || "",
            email: d.email || "",
            address: d.address || "",
            companyDetails: { gstin: d.companyDetails?.gstin || "", companyName: d.companyDetails?.companyName || "", gstDetail: d.companyDetails?.gstDetail || "" },
            addresses: d.addresses ? { billing: d.addresses.billing || null, shipping: d.addresses.shipping || null } : null,
          });
        } else setError(result.message || t("customers.errorLoading"));
      } catch (_err) { setError(t("customers.errorLoading")); }
      finally { setFetching(false); }
    };
    fetchCustomerData();
  }, [customerId, storeId, t]);

  const handleFormDataChange = (fieldName, value) => {
    // Logic for handling field updates and error clearing
    if (fieldName === "clearError") {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[value]; return n; });
      return;
    }
    setFieldErrors((prev) => {
      const n = { ...prev };
      if (n[fieldName]) delete n[fieldName];
      if (fieldName === "companyDetails") Object.keys(n).forEach(k => { if (k.startsWith("companyDetails.")) delete n[k]; });
      if (fieldName === "addresses") Object.keys(n).forEach(k => { if (k.startsWith("addresses.")) delete n[k]; });
      return n;
    });
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveAndUpdate = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      const result = await customerService.updateCustomer(customerId, formData, storeId);
      if (result.success) {
        showSuccess(t("customers.updateSuccess"));
        router.push("/dashboard/customers");
      } else if (result?.error?.data?.fields) {
        setFieldErrors(result.error.data.fields);
      } else showError(result.message || t("errors.failedToUpdate", { item: t("common.customer") }));
    } catch (err) { showError(t("errors.failedToUpdateTryAgain", { item: t("common.customer") })); }
    finally { setLoading(false); }
  };

  // Keyboard Shortcuts
  useCommonHotkeys({
    onSave: handleSaveAndUpdate,
    onBack: () => router.push("/dashboard/customers"),
    onClose: () => router.push("/dashboard/customers"),
  });

  if (fetching) return <LoadingState t={t} />;

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header title={t("customers.editCustomer")} description={t("customers.editCustomerDescription")} />
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.backTo", { item: t("common.customers") })}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: "calc(100vh - 200px)" }}>
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                  <CustomerForm formData={formData} onChange={handleFormDataChange} fieldErrors={fieldErrors} gstVerification={gstVerification} />
                </div>
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button variant="outline" onClick={() => router.push("/dashboard/customers")} disabled={loading}>Cancel</Button>
                  <Button variant="success" onClick={handleSaveAndUpdate} disabled={loading} loading={loading} leftIcon={Save}>Update Customer</Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  {/* Tips Section (Kept as is for aesthetics) */}
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center"><User className="w-5 h-5 text-[rgb(var(--color-primary))]" /></div>
                      <div>
                        <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Customer Update Tips</h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Keep details accurate</p>
                      </div>
                    </div>
                    {/* Simplified Tips for brevity in code */}
                    <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-3">
                      <li className="flex gap-2"><span>✅</span> Verify phone and email for reliable communication.</li>
                      <li className="flex gap-2"><span>🏠</span> Multiple addresses help in flexible shipping.</li>
                      <li className="flex gap-2"><span>🏢</span> Use GSTIN for B2B tax compliance.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPage;
