// Reset screen-only preview scaling in html2canvas's isolated document clone.
export function prepareInvoiceCapture(document) {
  document
    .querySelectorAll(".dragorbit-document-preview-paper")
    .forEach((element) => {
      element.style.transform = "none";
    });
  document
    .querySelectorAll(
      ".dragorbit-document-preview, .dragorbit-document-preview-frame"
    )
    .forEach((element) => {
      element.style.overflow = "visible";
      element.style.height = "auto";
      element.style.width = "auto";
    });
}
