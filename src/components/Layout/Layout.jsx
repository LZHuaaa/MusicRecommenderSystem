import React, { useState } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

// Add a Context to manage header visibility across components
export const HeaderVisibilityContext = React.createContext({
  isHeaderVisible: true,
  setHeaderVisible: () => {}
});

const Layout = ({ children }) => {
  const [isHeaderVisible, setHeaderVisible] = useState(true);
  
  return (
    <HeaderVisibilityContext.Provider value={{ isHeaderVisible, setHeaderVisible }}>
      <div className="min-h-screen bg-background overflow-y-auto">
        {isHeaderVisible && <Navbar />}
        <main className={`container mx-auto px-4 ${isHeaderVisible ? 'pt-20' : 'pt-0'} pb-32`}>
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </div>
    </HeaderVisibilityContext.Provider>
  );
};

export default Layout;