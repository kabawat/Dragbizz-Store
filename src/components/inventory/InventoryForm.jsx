"use client";
// Import UI components
import { Card, CardBody } from "@/components/ui";
// Import theme context
import { useTheme } from "@/contexts/ThemeContext";
// Import sections
import InventoryDetailsSection from "./InventoryDetailsSection";

const InventoryForm = ({
  formData = {},
  onChange = () => {},
  fieldErrors = {},
  className = "",
  ...props
}) => {
  const { themeConfig, currentVariant } = useTheme();

  // Theme-aware glass effect styles
  const getGlassStyles = () => {
    const isDark = currentVariant === "dark";

    if (isDark) {
      return {
        card: `backdrop-blur-md bg-black/20 border border-white/20 shadow-xl`,
        header: `border-b border-white/15`,
        body: ``,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm border-[${themeConfig.primary}]/10`,
        title: `text-white`,
        description: `text-gray-300`,
      };
    } else {
      return {
        card: `backdrop-blur-md bg-white/20 border border-gray-200/30`,
        header: `backdrop-blur-sm border-b border-gray-200/20`,
        body: `backdrop-blur-sm`,
        icon: `bg-[${themeConfig.primary}]/20 backdrop-blur-sm border border-gray-200/60`,
        title: `text-gray-800`,
        description: `text-gray-600`,
      };
    }
  };

  const glassStyles = getGlassStyles();

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    if (onChange) {
      onChange(fieldName, value);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className={`${glassStyles.card} h-full`}>
        <CardBody className={`${glassStyles.body} overflow-y-auto max-h-full`}>
          <InventoryDetailsSection
            formData={formData}
            onChange={handleFormDataChange}
            errors={fieldErrors}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default InventoryForm;
