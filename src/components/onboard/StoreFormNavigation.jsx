import { Button } from "@/components/ui";

export default function StoreFormNavigation({
  isSubmitting,
  formData,
  disabled,
}) {
  return (
    <div className="flex justify-end mt-6 pt-4 border-t border-[rgb(var(--color-border-primary))]">
      <Button
        type="submit"
        size="md"
        variant="primary"
        loading={isSubmitting}
        disabled={
          disabled ||
          isSubmitting ||
          !formData.name.trim() ||
          !formData.category.trim()
        }
        className="min-h-12 w-full sm:w-auto sm:min-w-[140px]"
      >
        {isSubmitting ? "Creating Store..." : "Create Store"}
      </Button>
    </div>
  );
}
