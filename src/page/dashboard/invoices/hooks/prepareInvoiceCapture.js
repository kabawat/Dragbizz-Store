// Reset screen-only preview scaling in html2canvas's isolated document clone.
export function prepareInvoiceCapture(document) {
  document
    .querySelectorAll(".dragorbit-document-preview-paper")
    .forEach((element) => {
      element.style.transform = "none";
    });
  document
    .querySelectorAll(
      ".dragorbit-document-preview, .dragorbit-document-preview-frame, .invoice-responsive-viewport, .invoice-responsive-frame"
    )
    .forEach((element) => {
      element.style.overflow = "visible";
      element.style.height = "auto";
      element.style.width = "auto";
    });
  const invoiceArea = document.getElementById("invoice-area");
  if (invoiceArea) {
    invoiceArea.style.position = "static";
    invoiceArea.style.opacity = "1";
    invoiceArea.style.left = "0";
    invoiceArea.style.display = "block";
    invoiceArea.style.visibility = "visible";
  }
  document.querySelectorAll(".invoice-responsive-page").forEach((element) => {
    element.style.width = "794px";
    element.style.transform = "none";
  });
}
