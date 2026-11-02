"use client";
import { Modal as SharedModal } from "@dragorbit/ui";

const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  full: "max-w-full",
};
const Modal = ({
  children,
  size = "md",
  className = "",
  showCloseButton = true,
  ...props
}) => (
  <SharedModal
    {...props}
    showCloseButton={showCloseButton}
    className={`w-full ${sizeClasses[size] || sizeClasses.md} ${className}`}
  >
    <div className="p-4">{children}</div>
  </SharedModal>
);

export { ModalBody, ModalFooter, ModalHeader } from "@dragorbit/ui";
export { Modal };
export default Modal;
