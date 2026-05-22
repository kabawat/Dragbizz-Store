// Robustly copies text to the clipboard.
export const copyToClipboard = async (text) => {
    if (!text) return false;

    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            
            // Fallback to legacy method
        }
    }

    // Legacy fallback method using textarea
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible or disruptive
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        return successful;
    } catch (err) {
        
        return false;
    }
};
