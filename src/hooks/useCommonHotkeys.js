import { useHotkeys } from './useHotkeys';

//  A hook to register common keyboard shortcuts used across pages.
export const useCommonHotkeys = ({
    onPrint,
    onDownload,
    onEdit,
    onDelete,
    onBack,
    onClose,
    onNew,
    onSave,
    onSearch,
    onViewTable,
    onViewGrid,
    onVoiceAI,
} = {}) => {
    const hotkeys = {};

    if (onVoiceAI) {
        hotkeys['alt+v'] = (e) => {
            e.preventDefault();
            onVoiceAI();
        };
    }

    if (onViewTable) {
        hotkeys['alt+1'] = (e) => {
            e.preventDefault();
            onViewTable();
        };
    }

    if (onViewGrid) {
        hotkeys['alt+2'] = (e) => {
            e.preventDefault();
            onViewGrid();
        };
    }

    if (onPrint) {
        hotkeys['ctrl+p'] = (e) => {
            e.preventDefault();
            onPrint();
        };
        hotkeys['f2'] = (e) => {
            e.preventDefault();
            onPrint();
        };
    }

    if (onDownload) {
        hotkeys['ctrl+d'] = (e) => {
            e.preventDefault();
            onDownload();
        };
    }

    if (onEdit) {
        hotkeys['ctrl+e'] = (e) => {
            e.preventDefault();
            onEdit();
        };
    }

    if (onDelete) {
        hotkeys['ctrl+delete'] = (e) => {
            e.preventDefault();
            onDelete();
        };
        hotkeys['delete'] = (e) => {
            e.preventDefault();
            onDelete();
        };
    }

    // Back Navigation (Ctrl + Esc)
    if (onBack) {
        hotkeys['ctrl+escape'] = (e) => {
            e.preventDefault();
            onBack();
        };
    }

    // Close UI (Esc)
    if (onClose) {
        hotkeys['escape'] = (e) => {
            e.preventDefault();
            onClose();
        };
    }

    if (onNew) {
        hotkeys['shift+n'] = (e) => {
            e.preventDefault();
            onNew();
        };
    }

    if (onSave) {
        hotkeys['ctrl+s'] = (e) => {
            e.preventDefault();
            onSave();
        };
        hotkeys['f1'] = (e) => {
            e.preventDefault();
            onSave();
        };
    }

    if (onSearch) {
        hotkeys['/'] = (e) => {
            e.preventDefault();
            onSearch();
        };
        hotkeys['ctrl+k'] = (e) => {
            e.preventDefault();
            onSearch();
        };
    }

    useHotkeys(hotkeys);
};
