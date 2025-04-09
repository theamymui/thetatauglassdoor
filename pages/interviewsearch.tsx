'use client';

import { useState, useEffect } from 'react';
import { Geist } from 'next/font/google';
import supabase from '../supabase'; // Adjust import path as needed

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

/* --------------------------------------------------------------------------
   1) Define the shape of the data we’ll fetch
-------------------------------------------------------------------------- */
type GeneralInfo = {
  id: number;
  name: string;
  major: string;
  email: string;
  company_name: string;
  industry: string;
  job_title: string;
  date: string;
  got_job: boolean;
};

type OurQuestion = {
  id: number;
  question: string;
};

type OurAnswer = {
  gen_info_id: number;
  question_id: number;
  answer: string;
  our_interview_question: OurQuestion | null; // Allow null for missing questions
};

type TheirQuestion = {
  gen_info_id: number;
  their_question_id: number;
  questions: string;
};

type TheirAnswer = {
  gen_info_id: number;
  their_question_id: number;
  their_answer: string;
};

type InterviewData = {
  general_info: GeneralInfo;
  our_answers: OurAnswer[];
  their_questions: TheirQuestion[];
  their_answers: TheirAnswer[];
};

/* --------------------------------------------------------------------------
   2) Component to fetch and display all interview answers
-------------------------------------------------------------------------- */
function InterviewAnswers() {
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all general information
        const { data: generalInfoData, error: generalInfoError } = await supabase
          .from('general_information')
          .select('*');

        if (generalInfoError) {
          throw generalInfoError;
        }

        if (!generalInfoData || generalInfoData.length === 0) {
          setInterviews([]);
          setFilteredInterviews([]);
          return;
        }

        // For each general info record, fetch related data
        const interviewDataPromises = generalInfoData.map(async (info: GeneralInfo) => {
          const genInfoId = info.id;

          // Fetch answers to `our_interview_questions`
          const { data: ourAnswersData, error: ourAnswersError } = await supabase
            .from('our_interview_answers')
            .select(`
              gen_info_id,
              question_id,
              answer,
              our_interview_question:question_id (
                id,
                question
              )
            `)
            .eq('gen_info_id', genInfoId);

          if (ourAnswersError) {
            throw ourAnswersError;
          }

          // Transform the data to match the OurAnswer type, handle missing questions
          const transformedOurAnswers: OurAnswer[] = (ourAnswersData || [])
            .map((answer: any) => ({
              gen_info_id: answer.gen_info_id,
              question_id: answer.question_id,
              answer: answer.answer,
              our_interview_question: answer.our_interview_question?.[0] || null, // Handle missing question
            }))
            .filter((answer) => answer.our_interview_question !== null); // Filter out answers with missing questions

          // Fetch user-added questions from `their_interview_questions`
          const { data: theirQuestionsData, error: theirQuestionsError } = await supabase
            .from('their_interview_questions')
            .select('gen_info_id, their_question_id, questions')
            .eq('gen_info_id', genInfoId);

          if (theirQuestionsError) {
            throw theirQuestionsError;
          }

          // Fetch answers to user-added questions from `their_interview_answers`
          const { data: theirAnswersData, error: theirAnswersError } = await supabase
            .from('their_interview_answers')
            .select('gen_info_id, their_question_id, their_answer')
            .eq('gen_info_id', genInfoId);

          if (theirAnswersError) {
            throw theirAnswersError;
          }

          return {
            general_info: info,
            our_answers: transformedOurAnswers,
            their_questions: theirQuestionsData || [],
            their_answers: theirAnswersData || [],
          };
        });

        const interviewData = await Promise.all(interviewDataPromises);
        // Sort by date descending (most recent first)
        const sortedInterviews = [...interviewData].sort((a, b) =>
          new Date(b.general_info.date).getTime() - new Date(a.general_info.date).getTime()
        );
        setInterviews(sortedInterviews);
        setFilteredInterviews(sortedInterviews);
      } catch (err) {
        console.error('Error fetching interview data:', err);
        setError('Failed to load interview data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInterviews(interviews);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = interviews.filter((interview) => {
      const { general_info } = interview;
      return (
        general_info.name.toLowerCase().includes(query) ||
        general_info.major.toLowerCase().includes(query) ||
        general_info.email.toLowerCase().includes(query) ||
        general_info.company_name.toLowerCase().includes(query) ||
        general_info.industry.toLowerCase().includes(query) ||
        general_info.job_title.toLowerCase().includes(query)
      );
    });

    setFilteredInterviews(filtered);
  }, [searchQuery, interviews]);

  if (loading) {
    return <p className="text-gray-500 text-center">Loading interview data...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, job title, etc..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Interview Cards */}
      {filteredInterviews.length === 0 ? (
        <p className="text-gray-500 text-center">
          {searchQuery ? 'No interviews match your search.' : 'No interviews found.'}
        </p>
      ) : (
        <div className="space-y-8">
          {filteredInterviews.map((interview, index) => (
            <div
              key={interview.general_info.id}
              className="border rounded-lg p-6 shadow-sm bg-white"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Interview {index + 1}
              </h2>

              {/* General Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">General Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Name:</strong> {interview.general_info.name}</p>
                  <p><strong>Major:</strong> {interview.general_info.major}</p>
                  <p><strong>Email:</strong> {interview.general_info.email}</p>
                  <p><strong>Company:</strong> {interview.general_info.company_name}</p>
                  <p><strong>Industry:</strong> {interview.general_info.industry}</p>
                  <p><strong>Job Title:</strong> {interview.general_info.job_title}</p>
                  <p><strong>Date:</strong> {interview.general_info.date}</p>
                  <p><strong>Got the Job:</strong> {interview.general_info.got_job ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Our Interview Questions Answers */}
              {interview.our_answers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Our Interview Questions</h3>
                  <div className="space-y-4">
                    {interview.our_answers.map((answer, idx) => (
                      <div key={answer.question_id} className="space-y-1">
                        <p className="font-medium text-gray-600">
                          Q{idx + 1}: {answer.our_interview_question?.question || 'Question not found'}
                        </p>
                        <p className="text-gray-500">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Their Interview Questions and Answers */}
              {interview.their_questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Their Interview Questions</h3>
                  <div className="space-y-4">
                    {interview.their_questions.map((question, idx) => {
                      const relatedAnswer = interview.their_answers.find(
                        (answer) => answer.their_question_id === question.their_question_id
                      );
                      return (
                        <div key={question.their_question_id} className="space-y-1">
                          <p className="font-medium text-gray-600">
                            Q{idx + 1}: {question.questions}
                          </p>
                          {relatedAnswer ? (
                            <p className="text-gray-500">{relatedAnswer.their_answer}</p>
                          ) : (
                            <p className="text-gray-400 italic">No answer provided.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   3) Main InterviewSearch Page
-------------------------------------------------------------------------- */
export default function InterviewSearch() {
  return (
    <div
      className={`
        flex flex-col min-h-screen p-8 pb-20 sm:p-20 
        font-[family-name:var(--font-geist-sans)]
        ${geistSans.variable}
      `}
    >
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Interview Search
        </h1>
        <div className="mt-12">
          <InterviewAnswers />
        </div>
      </div>
    </div>
  );
}