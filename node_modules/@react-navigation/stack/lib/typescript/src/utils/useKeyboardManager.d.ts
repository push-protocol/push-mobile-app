export default function useKeyboardManager(isEnabled: () => boolean): {
    onPageChangeStart: () => void;
    onPageChangeConfirm: (force: boolean) => void;
    onPageChangeCancel: () => void;
};
