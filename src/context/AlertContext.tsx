'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AlertType = 'success' | 'error' | 'info';

interface Alert {
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (message: string, type: AlertType = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // desaparece a los 3 segundos
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* ALERTA FLOTANTE */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white font-medium
              ${
                alert.type === 'success'
                  ? 'bg-green-500'
                  : alert.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
          >
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de un <AlertProvider>');
  }
  return context;
}
