import { useToast } from "../contexts/ToastContext";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  customMessage?: string;
}

export const useErrorHandler = () => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, logError = true, customMessage } = options;

    if (logError) {
      console.error("Error occurred:", error);
    }

    if (showToast) {
      const errorMessage =
        customMessage ||
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "An unexpected error occurred";

      showError("Error", errorMessage);
    }
  };

  const handleSuccess = (
    title: string,
    message?: string,
    duration?: number
  ) => {
    showSuccess(title, message, duration);
  };

  const handleWarning = (
    title: string,
    message?: string,
    duration?: number
  ) => {
    showWarning(title, message, duration);
  };

  const handleInfo = (title: string, message?: string, duration?: number) => {
    showInfo(title, message, duration);
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};
