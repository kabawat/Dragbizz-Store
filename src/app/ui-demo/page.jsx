"use client";
import { useState } from "react";
import {
  Accordion,
  Alert,
  AnimatedBackground,
  Badge,
  Button,
  Card,
  FileUpload,
  Modal,
  MultiSelect,
  Pagination,
  RichTextEditor,
  StepProgress,
  SVGBackground,
  Tabs,
  TagInput,
  Toggle,
} from "@/components/ui";

const UIDemoPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [tabsValue, setTabsValue] = useState("tab1");
  const [tags, setTags] = useState(["React", "Next.js"]);
  const [richTextValue, setRichTextValue] = useState(
    "<p>Hello <strong>World</strong>!</p>"
  );
  const [fileUploadValue, setFileUploadValue] = useState([]);

  const _dropdownOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const multiSelectOptions = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
  ];

  const _selectOptions = [
    { value: "india", label: "India" },
    { value: "usa", label: "USA" },
    { value: "uk", label: "UK" },
  ];

  const stepProgressSteps = [
    { title: "Step 1", description: "Basic Information", completed: true },
    { title: "Step 2", description: "Contact Details", completed: true },
    { title: "Step 3", description: "Preferences", completed: false },
    { title: "Step 4", description: "Review", completed: false },
  ];

  const accordionItems = [
    {
      id: "react",
      title: "What is React?",
      content:
        "React is a JavaScript library for building user interfaces, particularly web applications.",
    },
    {
      id: "nextjs",
      title: "What is Next.js?",
      content:
        "Next.js is a React framework that provides additional features like server-side rendering and static site generation.",
    },
  ];

  const tabItems = [
    { value: "tab1", label: "Tab 1", content: "Content for Tab 1" },
    { value: "tab2", label: "Tab 2", content: "Content for Tab 2" },
    { value: "tab3", label: "Tab 3", content: "Content for Tab 3" },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <SVGBackground />

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
            UI Components Demo
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-md">
            Testing all unused UI components to see how they look and work
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Accordion */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Accordion Component
              </h3>
              <Accordion
                items={accordionItems}
                allowMultiple={true}
                defaultOpenItems={["react"]}
              />
            </Card>

            {/* File Upload */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                File Upload Component
              </h3>
              <FileUpload
                value={fileUploadValue}
                onChange={setFileUploadValue}
                accept="image/*"
                multiple={false}
                label="Upload Image"
                helperText="Select an image file to upload"
              />
            </Card>

            {/* Rich Text Editor */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Rich Text Editor
              </h3>
              <RichTextEditor
                value={richTextValue}
                onChange={setRichTextValue}
                placeholder="Start typing..."
                label="Rich Text Content"
              />
            </Card>
            {/* Tabs */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Tabs Component
              </h3>
              <Tabs
                value={tabsValue}
                onChange={setTabsValue}
                items={tabItems}
                variant="default"
              />
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Step Progress */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Step Progress
              </h3>
              <StepProgress
                steps={stepProgressSteps}
                currentStep={2}
                orientation="vertical"
                showLabels={true}
                showIcons={true}
              />
            </Card>

            {/* Tag Input */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Tag Input
              </h3>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags..."
                label="Tags"
                maxTags={5}
                maxTagLength={20}
              />
            </Card>

            {/* Multi Select */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Multi Select
              </h3>
              <MultiSelect
                options={multiSelectOptions}
                value={["react", "vue"]}
                placeholder="Select frameworks..."
                label="Frameworks"
                searchable={true}
              />
            </Card>

            {/* Pagination */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Pagination
              </h3>
              <Pagination
                currentPage={3}
                totalPages={10}
                showFirstLast={true}
                showPrevNext={true}
              />
            </Card>

            {/* Modal Trigger */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                Modal Component
              </h3>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Open Modal
              </Button>
            </Card>
          </div>
        </div>

        {/* Additional Components Row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Examples */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
              Alert Variants
            </h3>
            <div className="space-y-3">
              <Alert
                variant="success"
                title="Success!"
                message="Operation completed successfully."
              />
              <Alert
                variant="warning"
                title="Warning!"
                message="Please check your input."
              />
              <Alert
                variant="error"
                title="Error!"
                message="Something went wrong."
              />
              <Alert
                variant="info"
                title="Info"
                message="Here's some useful information."
              />
            </div>
          </Card>

          {/* Badge Examples */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
              Badge Variants
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </Card>

          {/* Toggle Examples */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
              Toggle Examples
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[rgb(var(--color-text-primary))]">
                  Enable Notifications
                </span>
                <Toggle checked={true} onChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[rgb(var(--color-text-primary))]">
                  Dark Mode
                </span>
                <Toggle checked={false} onChange={() => {}} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
            Modal Demo
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            This is a demo modal to test the Modal component functionality.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UIDemoPage;
