// @ts-nocheck

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../supabase'; // Adjust the import path as needed

// Define the type for the interview data based on your Supabase schema
interface Interview {
  id: number;
  name: string;
  major: string;
  email: string;
  company_name: string;
  industry: string;
  job_title: string;
  date: string;
  got_job: boolean;
  created_at: string;
}

const CompanyPage = () => {
  const router = useRouter();
  const { companyName } = router.query; // Get the companyName from the URL
  console.log(companyName);
  // Explicitly type the interviews state
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (companyName) {
        const { data, error } = await supabase
          .from('general_information') // Adjust the table name as needed
          .select('*')
          .eq('company_name', companyName);

        if (error) {
          console.error('Error fetching company:', error);
        } else {
          // TypeScript now knows data matches the Interview type
          setInterviews(data);
        }
      }
    };

    fetchInterviews();
  }, [companyName]);

  if (!companyName) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Center and enlarge the company name */}
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
        {companyName as string} {/* Cast to string since router.query can be string | string[] */}
      </h1>

      {/* Interview Cards */}
      <div className="max-w-4xl mx-auto px-4">
        {interviews.length === 0 ? (
          <p className="text-gray-500 text-center">
            {'No interviews match your search.'}
          </p>
        ) : (
          <div className="space-y-8">
            {interviews.map((interview, index) => (
              <div
                key={interview.id}
                className="border rounded-lg p-6 shadow-sm bg-white"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Interview {index + 1}
                </h2>

                {/* General Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">General Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p><strong>Name:</strong> {interview.name}</p>
                    <p><strong>Major:</strong> {interview.major}</p>
                    <p><strong>Email:</strong> {interview.email}</p>
                    <p><strong>Company:</strong> {interview.company_name}</p>
                    <p><strong>Industry:</strong> {interview.industry}</p>
                    <p><strong>Job Title:</strong> {interview.job_title}</p>
                    <p><strong>Date:</strong> {interview.date}</p>
                    <p><strong>Got the Job:</strong> {interview.got_job ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPage;