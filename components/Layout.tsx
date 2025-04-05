import React, { ReactNode } from 'react';
import Navbar from './NavBar';




interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    
      
      
      <div className="flex flex-col min-h-screen font-custom">

         
        <Navbar/> 
     
        <div className="flex flex-col flex-grow pt-24 px-4 sm:px-8 mb-24 text-red-800">
          {children}
        </div>
        
        
        <div className="flex-row bottom-0">
        </div>

      </div>
    
  );
};

export default Layout;