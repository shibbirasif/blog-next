import { toast, ToastContent, ToastOptions, Id } from "react-toastify";

type AlertType = "success" | "error" | "info" | "warning" | "default";

const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

const showAlert = (type: AlertType, content: ToastContent, options: Partial<ToastOptions> = {}): Id => {
    const finalOptions = { ...defaultOptions, ...options };

    switch (type) {
        case "success":
            return toast.success(content, finalOptions);
        case "error":
            return toast.error(content, finalOptions);
        case "info":
            return toast.info(content, finalOptions);
        case "warning":
            return toast.warn(content, finalOptions);
        default:
            return toast(content, finalOptions);
    }
};

export const alerts = {
    success: (content: ToastContent, options?: Partial<ToastOptions>) => showAlert("success", content, options),
    error: (content: ToastContent, options?: Partial<ToastOptions>) => showAlert("error", content, options),
    info: (content: ToastContent, options?: Partial<ToastOptions>) => showAlert("info", content, options),
    warning: (content: ToastContent, options?: Partial<ToastOptions>) => showAlert("warning", content, options),
    default: (content: ToastContent, options?: Partial<ToastOptions>) => showAlert("default", content, options)
};