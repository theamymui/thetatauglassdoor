'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import supabase from '../supabase'; // Adjust import if needed

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* --------------------------------------------------------------------------
   1) Define the "General Info" fields
   (Matches the `general_information` table columns)
-------------------------------------------------------------------------- */
type GeneralInfo = {
  name: string;
  major: string;
  email: string;
  company_name: string;
  industry: string;
  job_title: string;
  date: string;   // in YYYY-MM-DD format
  got_job: boolean; // boolean
};

/* --------------------------------------------------------------------------
   2) Define the Q/A pairs shape

   Each Q/A pair has:
   - question: for `their_interview_questions.questions`
   - answer: for `their_interview_answers.their_answer`
-------------------------------------------------------------------------- */
type QA = {
  question: string;
  answer: string;
};

export default function AddInterview() {
  /* -------------------------------------------------------
     (A) State for General Info
  ------------------------------------------------------- */
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    name: '',
    major: '',
    email: '',
    company_name: '',
    industry: '',
    job_title: '',
    date: '',
    got_job: false,
  });

  /* -------------------------------------------------------
     (B) State for Q/A Pairs
     Start with one blank pair
  ------------------------------------------------------- */
  const [qaList, setQaList] = useState<QA[]>([
    { question: '', answer: '' },
  ]);

  /* -------------------------------------------------------
     (C) Error, Success, Loading
  ------------------------------------------------------- */
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /* -------------------------------------------------------
     (D) Handle changes for General Info (text & checkbox)
  ------------------------------------------------------- */
  function handleGeneralInfoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setGeneralInfo((prev) => ({ ...prev, [name]: checked }));
    } else {
      setGeneralInfo((prev) => ({ ...prev, [name]: value }));
    }
  }

  /* -------------------------------------------------------
     (E) Handle changes for a Q/A pair (question or answer)
  ------------------------------------------------------- */
  function handleQaChange(index: number, field: 'question' | 'answer', value: string) {
    setQaList((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  }

  /* -------------------------------------------------------
     (F) Add a new Q/A pair
  ------------------------------------------------------- */
  function addQaPair() {
    setQaList((prev) => [...prev, { question: '', answer: '' }]);
  }

  /* -------------------------------------------------------
     (G) Remove a Q/A pair
  ------------------------------------------------------- */
  function removeQaPair(index: number) {
    setQaList((prev) => prev.filter((_, i) => i !== index));
  }

  /* -------------------------------------------------------
     (H) Submit everything in a single go
  ------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Basic validation for General Info
    const {
      name,
      major,
      email,
      company_name,
      industry,
      job_title,
      date,
    } = generalInfo;

    if (!name || !major || !email || !company_name || !industry || !job_title || !date) {
      setLoading(false);
      setError('Please fill out all required General Info fields.');
      return;
    }

    try {
      // ---------------------------------------------------------------
      // 1) Insert into `general_information` table
      // ---------------------------------------------------------------
      const { data: genInfoData, error: genInfoError } = await supabase
        .from('general_information')
        .insert([generalInfo])
        .select('id')
        .single(); // We want the new record's id

      if (genInfoError) {
        throw genInfoError;
      }
      const genInfoId = genInfoData?.id;
      if (!genInfoId) {
        throw new Error('No new gen_info_id returned from Supabase.');
      }

      // ---------------------------------------------------------------
      // 2) For each Q/A, if question is filled in, insert Q, then A
      // ---------------------------------------------------------------
      for (const qa of qaList) {
        const { question, answer } = qa;
        const trimmedQ = question.trim();
        const trimmedA = answer.trim();

        // Skip if question is empty
        if (!trimmedQ) continue;

        // a) Insert question
        const { data: questionData, error: qError } = await supabase
          .from('their_interview_questions')
          .insert([
            {
              gen_info_id: genInfoId,
              questions: trimmedQ,
            },
          ])
          .select('their_question_id')
          .single();

        if (qError) {
          throw qError;
        }

        const questionId = questionData?.their_question_id;
        if (!questionId) {
          throw new Error('No new question_id returned from Supabase.');
        }

        // b) Insert answer if provided
        if (trimmedA) {
          const { error: aError } = await supabase
            .from('their_interview_answers')
            .insert([
              {
                gen_info_id: genInfoId,
                their_question_id: questionId,
                their_answer: trimmedA,
              },
            ]);

          if (aError) {
            throw aError;
          }
        }
      }

      // If we reach here, everything was successful
      setSuccess('Interview info and questions submitted successfully!');

      // Optional: Reset form
      setGeneralInfo({
        name: '',
        major: '',
        email: '',
        company_name: '',
        industry: '',
        job_title: '',
        date: '',
        got_job: false,
      });
      setQaList([{ question: '', answer: '' }]);
    } catch (err) {
      console.error('Error inserting Q/A data:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`
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
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Add Interview
        </h1>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ------------------ General Info Section ------------------ */}
          <h2 className="text-xl font-semibold text-gray-700">
            General Information
          </h2>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={generalInfo.name}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Major */}
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major *
            </label>
            <input
              type="text"
              id="major"
              name="major"
              value={generalInfo.major}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={generalInfo.email}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., john.doe@example.com"
            />
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name *
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={generalInfo.company_name}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., Theta Tau"
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry *
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={generalInfo.industry}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., Technology"
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
              Job Title *
            </label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={generalInfo.job_title}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
              placeholder="e.g., Software Engineer"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Interview Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={generalInfo.date}
              onChange={handleGeneralInfoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                         shadow-sm focus:outline-none focus:ring-2 
                         focus:ring-indigo-500 focus:border-indigo-500 
                         sm:text-sm"
            />
          </div>

          {/* Got the job? (checkbox) */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="got_job"
              name="got_job"
              checked={generalInfo.got_job}
              onChange={handleGeneralInfoChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 
                         rounded focus:ring-indigo-500"
            />
            <label htmlFor="got_job" className="text-sm font-medium text-gray-700">
              Got the job?
            </label>
          </div>

          {/* ------------------ Q/A Section ------------------ */}
          <h2 className="text-xl font-semibold text-gray-700">
            Interview Questions (optional)
          </h2>
          <p className="text-sm text-gray-500">
            Add any questions you were asked and optionally how you answered.
          </p>

          {/* Render each Q/A pair */}
          {qaList.map((qa, index) => (
            <div
              key={index}
              className="border p-4 rounded-md shadow-sm space-y-3 relative"
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeQaPair(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                title="Remove this question"
              >
                ✕
              </button>

              {/* Question */}
              <div>
                <label
                  htmlFor={`question-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Question {index + 1}
                </label>
                <input
                  type="text"
                  id={`question-${index}`}
                  value={qa.question}
                  onChange={(e) => handleQaChange(index, 'question', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 
                             rounded-md shadow-sm focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 
                             focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., What is polymorphism?"
                />
              </div>

              {/* Answer */}
              <div>
                <label
                  htmlFor={`answer-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Answer or Notes
                </label>
                <textarea
                  id={`answer-${index}`}
                  value={qa.answer}
                  onChange={(e) => handleQaChange(index, 'answer', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 
                             rounded-md shadow-sm focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 
                             focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. Talked about OOP, inheritance, etc."
                />
              </div>
            </div>
          ))}

          {/* Button to add more Q/A pairs */}
          <button
            type="button"
            onClick={addQaPair}
            className="inline-flex items-center px-3 py-2 bg-gray-100 
                       text-sm text-gray-700 rounded-md border 
                       border-gray-300 hover:bg-gray-200"
          >
            + Add Another Q/A
          </button>

          {/* Error or Success */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center py-2 px-4 border 
                          border-transparent shadow-sm text-sm font-medium 
                          rounded-md text-white bg-[#8b0000] 
                          hover:bg-[#a30000] focus:outline-none 
                          focus:ring-2 focus:ring-offset-2 
                          focus:ring-[#8b0000]
                          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : 'Submit All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
