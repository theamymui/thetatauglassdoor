// @ts-nocheck

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../supabase'; // Adjust the import path as needed

// Define types based on your Supabase schema
interface GeneralInfo {
  id: number;
  created_at: string;
  name: string;
  major: string;
  email: string;
  company_name: string;
  industry: string;
  job_title: string;
  date: string;
  got_job: boolean;
}

interface OurQuestion {
  id: number;
  created_at: string;
  question: string;
}

interface OurAnswer {
  gen_info_id: number;
  question_id: number;
  answer: string;
  our_interview_questions: OurQuestion | null; // Allow null for missing questions
}

interface TheirQuestion {
  gen_info_id: number;
  their_question_id: number;
  questions: string;
}

interface TheirAnswer {
  gen_info_id: number;
  their_question_id: number;
  their_answer: string;
}

interface Interview {
  general_info: GeneralInfo;
  our_answers: OurAnswer[];
  their_questions: TheirQuestion[];
  their_answers: TheirAnswer[];
}

const CompanyPage = () => {
  const router = useRouter();
  const { companyName } = router.query; // Get the companyName from the URL
  console.log(companyName);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!companyName) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch general information for the specific company
        const { data: generalInfoData, error: generalInfoError } = await supabase
          .from('general_information')
          .select('*')
          .eq('company_name', companyName);

        if (generalInfoError) {
          throw new Error(`Failed to fetch general information: ${generalInfoError.message}`);
        }

        if (!generalInfoData || generalInfoData.length === 0) {
          setInterviews([]);
          return;
        }

        // For each general info record, fetch related questions and answers
        const interviewDataPromises = generalInfoData.map(async (info: GeneralInfo) => {
          const genInfoId = info.id;

          // Fetch answers to `our_interview_questions` with related question data
          const { data: ourAnswersData, error: ourAnswersError } = await supabase
            .from('our_interview_answers')
            .select(`
              gen_info_id,
              question_id,
              answer,
              our_interview_questions:question_id (
                id,
                created_at,
                question
              )
            `)
            .eq('gen_info_id', genInfoId);

          if (ourAnswersError) {
            throw new Error(`Failed to fetch our interview answers: ${ourAnswersError.message}`);
          }

          // Transform the data to match the OurAnswer type, handle missing questions
          const transformedOurAnswers: OurAnswer[] = (ourAnswersData || [])
            .map((answer: any) => ({
              gen_info_id: answer.gen_info_id,
              question_id: answer.question_id,
              answer: answer.answer,
              our_interview_questions: answer.our_interview_questions || null,
            }))
            .filter((answer) => answer.our_interview_questions !== null); // Filter out answers with missing questions

          // Fetch user-added questions from `their_interview_questions`
          const { data: theirQuestionsData, error: theirQuestionsError } = await supabase
            .from('their_interview_questions')
            .select('gen_info_id, their_question_id, questions')
            .eq('gen_info_id', genInfoId);

          if (theirQuestionsError) {
            throw new Error(`Failed to fetch their interview questions: ${theirQuestionsError.message}`);
          }

          // Fetch answers to user-added questions from `their_interview_answers`
          const { data: theirAnswersData, error: theirAnswersError } = await supabase
            .from('their_interview_answers')
            .select('gen_info_id, their_question_id, their_answer')
            .eq('gen_info_id', genInfoId);

          if (theirAnswersError) {
            throw new Error(`Failed to fetch their interview answers: ${theirAnswersError.message}`);
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
      } catch (err: any) {
        console.error('Error fetching interview data:', err);
        setError(err.message || 'Failed to load interview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [companyName]);

  if (loading) return <p className="text-gray-500 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!companyName) return <p className="text-gray-500 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Center and enlarge the company name */}
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
        {companyName as string} {/* Cast to string since router.query can be string | string[] */}
      </h1>

      {/* Interview Cards */}
      <div className="max-w-4xl mx-auto px-4">
        {interviews.length === 0 ? (
          <p className="text-gray-500 text-center">{'No interviews match your search.'}</p>
        ) : (
          <div className="space-y-8">
            {interviews.map((interview, index) => (
              <div key={interview.general_info.id} className="border rounded-lg p-6 shadow-sm bg-white">
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
                        <div key={`${answer.question_id}-${idx}`} className="space-y-1">
                          <p className="font-medium text-gray-600">
                            Q{idx + 1}: {answer.our_interview_questions?.question || 'Question not found'}
                          </p>
                          <p className="text-gray-500">{answer.answer || 'No answer provided'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Their Interview Questions and Answers */}
                {interview.their_questions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Their Interview Questions</h3>
                    <div className="space-y-4">
                      {interview.their_questions.map((question, idx) => {
                        const relatedAnswer = interview.their_answers.find(
                          (answer) => answer.their_question_id === question.their_question_id
                        );
                        return (
                          <div key={`${question.their_question_id}-${idx}`} className="space-y-1">
                            <p className="font-medium text-gray-600">
                              Q{idx + 1}: {question.questions || 'Question not found'}
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
    </div>
  );
};

export default CompanyPage;