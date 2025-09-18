import React, { useState, useEffect } from "react";
import { FiClock, FiAlertTriangle } from "react-icons/fi";

interface InactivityWarningModalProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  warningDuration?: number; // Duration in seconds for the warning countdown
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  onExtendSession,
  onLogout,
  warningDuration = 60, // Default 60 seconds (1 minute)
}) => {
  const [timeLeft, setTimeLeft] = useState(warningDuration);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(warningDuration);
      return;
    }

    // Start countdown when modal opens
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout(); // Auto logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, warningDuration, onLogout]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - non-clickable to prevent accidental dismissal */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Session Timeout Warning
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    You have been inactive for a while. For security reasons,
                    you will be automatically logged out soon.
                  </p>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Action Required:</strong> Please choose to extend
                      your session or you will be logged out automatically.
                    </p>
                  </div>

                  {/* Countdown display */}
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-4">
                    <FiClock className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-2xl font-mono font-bold text-orange-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Click "Stay Logged In" to continue your session or you will
                    be automatically logged out.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onExtendSession}
            >
              Stay Logged In
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onLogout}
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
