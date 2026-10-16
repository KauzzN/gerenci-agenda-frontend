import { useEffect, useRef } from "react";

const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

function useModalAccessibility({ onClose, hasUnsavedChanges = false, canClose = true }) {
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
    const canCloseRef = useRef(canClose);
    onCloseRef.current = onClose;
    hasUnsavedChangesRef.current = hasUnsavedChanges;
    canCloseRef.current = canClose;

    function requestClose() {
        if (!canCloseRef.current) return;
        if (hasUnsavedChangesRef.current && !window.confirm("Descartar as alterações não salvas?")) return;
        onCloseRef.current();
    }

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement;
        const focusableElements = Array.from(dialog?.querySelectorAll(focusableSelector) || [])
            .filter((element) => !element.closest("[hidden], [aria-hidden='true']"));

        if (focusableElements.length) {
            focusableElements[0].focus();
        } else {
            dialog?.focus();
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                event.preventDefault();
                requestClose();
                return;
            }

            if (event.key !== "Tab" || !dialog) return;
            const currentFocusableElements = Array.from(dialog.querySelectorAll(focusableSelector))
                .filter((element) => !element.closest("[hidden], [aria-hidden='true']"));

            if (!currentFocusableElements.length) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const first = currentFocusableElements[0];
            const last = currentFocusableElements[currentFocusableElements.length - 1];
            if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, []);

    return { dialogRef, requestClose };
}

export default useModalAccessibility;
