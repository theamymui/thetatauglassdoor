'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import supabase from '../supabase'; // Adjust the path if needed

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type FormData = {
  name: string;
  major: string;
  email: string;
  company_name: string;
  industry: string;
  job_title: string;
  date: string; 
  job: string;
};

export default function AddInterview() {
  // State to manage form inputs
  const [formData, setFormData] = useState<FormData>({
    name: '',
    major: '',
    email: '',
    company_name: '',
    industry: '',
    job_title: '',
    date: '',
    job: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (
      !formData.name ||
      !formData.major ||
      !formData.email ||
      !formData.company_name ||
      !formData.industry ||
      !formData.job_title ||
      !formData.date ||
      !formData.job
    ) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const { data, error: insertError } = await supabase.from('general_information').insert([
        {
          name: formData.name,
          major: formData.major,
          email: formData.email,
          company_name: formData.company_name,
          industry: formData.industry,
          job_title: formData.job_title,
          date: formData.date,
          job: formData.job,
        },
      ]);

      if (insertError) throw insertError;

      // Clear the form on success
      setFormData({
        name: '',
        major: '',
        email: '',
        company_name: '',
        industry: '',
        job_title: '',
        date: '',
        job: '',
      });
      setSuccess('General information submitted successfully!');
    } catch (err) {
      console.error('Error submitting to Supabase:', err);
      setError('Failed to submit general information. Please try again.');
    }
  };

  return (
    <div
      className={`
        /* Remove the grid & centering classes */
        flex
        flex-col
        min-h-screen
        p-8
        pb-20
        sm:p-20
        font-[family-name:var(--font-geist-sans)]
        ${geistSans.variable}
      `}
    >
      {/* Constrain the width and center horizontally */}
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Add General Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Major Field */}
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major
            </label>
            <input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., john.doe@example.com"
            />
          </div>

          {/* Company Name Field */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Theta Tau"
            />
          </div>

          {/* Industry Field */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Technology"
            />
          </div>

          {/* Job Title Field */}
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Software Engineer"
            />
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Interview Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Job Description Field */}
          <div>
            <label htmlFor="job" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="job"
              name="job"
              value={formData.job}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-md shadow-sm focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Describe the role and responsibilities."
            />
          </div>

          {/* Error/Success Messages */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border 
                         border-transparent shadow-sm text-sm font-medium 
                         rounded-md text-white bg-[#8b0000] 
                         hover:bg-[#a30000] focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 
                         focus:ring-[#8b0000]"
            >
              Submit General Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
