import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  // Sample company data
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Amazon', logo: 'amazon_logo.png' },
    { id: 2, name: 'Google', logo: '/google-logo.png' },
    { id: 3, name: 'Microsoft', logo: '/microsoft-logo.png' },
    { id: 4, name: 'Apple', logo: '/apple-logo.png' },
    { id: 5, name: 'Facebook', logo: '/facebook-logo.png' },
    { id: 6, name: 'Netflix', logo: '/netflix-logo.png' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Company Directory</title>
        <meta name="description" content="Company reviews and ratings" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">OUR POSITIONS</h2>
        
        {/* Company cards grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div 
              key={company.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                console.log(`Navigating to ${company.name} page`);
              }}
            >
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  {/* Placeholder for company logo */}
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    {company.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center">
                  {company.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}