"use client";
import { ArrowLeft, CheckCircle, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { TEMPLATE_OPTIONS } from "@/components/templates/invoice";
import { AnimatedBackground } from "@/components/ui";

const InvoiceTemplateSettingsContent = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [_saved, setSaved] = useState(false);

  // Load current template from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  // Handle template change
  // const handleTemplateChange = (template) => {
  //     setSelectedTemplate(template);
  //     setSaved(false);
  // };
  const handleTemplateChange = async (template) => {
    setSelectedTemplate(template);
    await localStorage.setItem("invoice-template", template);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      goBack();
    }, 500);
  };
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboard/invoices");
    }
  }
  // Handle save template as default
  const _handleSaveTemplate = () => {
    localStorage.setItem("invoice-template", selectedTemplate);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Header */}
        <Header
          title="Invoice Template Settings"
          description="Select and save your default invoice template"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Back Button and Save Button - Sticky Top */}
          <div className="flex-shrink-0 p-6 pb-4 bg-[rgb(var(--color-bg-secondary))] sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => goBack()}
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Invoices</span>
              </button>
              {/* <Button
                                onClick={handleSaveTemplate}
                                variant="primary"
                                className="flex items-center gap-2"
                                disabled={saved}
                            >
                                {saved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Settings className="w-4 h-4" />
                                        Save as Default
                                    </>
                                )}
                            </Button> */}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-5 min-h-0">
            <div className="w-full">
              {/* Settings Card */}
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl">
                {/* Template Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {TEMPLATE_OPTIONS.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => handleTemplateChange(template.value)}
                      className={`relative p-1 rounded-lg border-2 overflow-hidden transition-all ${selectedTemplate === template.value
                        ? "border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/10"
                        : "border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))]/50 hover:bg-[rgb(var(--color-bg-secondary))]"
                        }`}
                    >
                      {selectedTemplate === template.value && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="w-6 h-6 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="relative">
                        <Image
                          src={template.preview}
                          alt={template.label}
                          width={400}
                          height={160}
                          className="w-full h-40 object-cover rounded-md"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center h-40 bg-[rgb(var(--color-bg-tertiary))] rounded-md">
                          <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                            {template.label}
                          </div>
                          <div className="text-xs text-[rgb(var(--color-text-secondary))] text-center px-2">
                            {template.description}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-md">
                          <div className="text-xs font-semibold text-white text-center">
                            {template.label}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Selection Info */}
                <div className="mt-6 p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      Current Selection:{" "}
                      <span className="text-[rgb(var(--color-primary))]">
                        {TEMPLATE_OPTIONS.find(
                          (t) => t.value === selectedTemplate
                        )?.label || "Modern"}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                    Click "Save as Default" to set this template as your
                    default. It will be automatically used for all new invoices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceTemplateSettingsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))]">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <InvoiceTemplateSettingsContent />
    </Suspense>
  );
};

export default InvoiceTemplateSettingsPage;
