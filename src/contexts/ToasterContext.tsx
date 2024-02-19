import React, {createContext, createRef} from 'react';
import {Toaster} from 'src/components/indicators/Toaster';

const toastRef = createRef<Toaster>();

export const ToasterContext = createContext({
  toastRef,
});

export const useToaster = () => {
  const context = React.useContext(ToasterContext);
  if (!context)
    throw new Error('useToaster must be used within a ToasterContextProvider');

  return context;
};

interface ToasterContextProviderProps {
  children: React.ReactNode;
}

const ToasterContextProvider = ({children}: ToasterContextProviderProps) => {
  return (
    <ToasterContext.Provider value={{toastRef}}>
      <Toaster ref={toastRef} />
      {children}
    </ToasterContext.Provider>
  );
};

export default ToasterContextProvider;
