import { useState, useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

// Initialize Supabase client (assumes you have environment variables set up)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const router = useRouter(); // Move useRouter inside the component
  const [companies, setCompanies] = useState([]);

  // Fetch unique company names from Supabase
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Fetch data from the general_information table
        const { data, error } = await supabase
          .from('general_information')
          .select('company_name');

        if (error) {
          console.error('Error fetching companies:', error);
          return;
        }

        // Extract unique company names
        const uniqueCompanies = [...new Set(data.map(item => item.company_name))]
          .filter(name => name) // Remove any null/empty names
          .map((name, index) => ({
            id: index + 1, // Generate a simple ID for each unique company
            name, // Use the company name
            logo: `/placeholder-logo.png` // Placeholder logo (you can update this later)
          }));

        setCompanies(uniqueCompanies);
        
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchCompanies();
    
  }, []); // Empty dependency array means this runs once on mount

  console.log(companies)

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Company Directory</title>
        <meta name="description" content="Company reviews and ratings" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">OUR COMPANIES</h2>
        
        {/* Company cards grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length > 0 ? (
            companies.map((company) => (
              <div 
                key={company.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => {
                  // Fix the router.push argument: use company.name and encode it
                  router.push(`/companies/${encodeURIComponent(company.name)}`);
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
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-3">
              No companies found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}