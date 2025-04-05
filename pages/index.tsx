/*import  supabase  from '../supabase';
import { useEffect, useState } from 'react';

type QuestionWithAnswers = {
  id: number;
  created_at: string;
  question: string;
  answers: string[];
};

export default function Home() {
  const [data, setData] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionsWithAnswers = async () => {
      // 1. Fetch all questions
      const { data: questions, error: questionsError } = await supabase
        .from('our_interview_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError.message);
        setLoading(false);
        return;
      }

      // 2. For each question, fetch the corresponding answers
      const enriched = await Promise.all(
        (questions || []).map(async (q) => {
          const { data: answers, error: answersError } = await supabase
            .from('our_interview_answers')
            .select('answer')
            .eq('question_id', q.id);

          if (answersError) {
            console.error(`Error fetching answers for question ${q.id}:`, answersError.message);
          }

          return {
            ...q,
            answers: answers?.map((a) => a.answer) || [],
          };
        })
      );

      setData(enriched);
      setLoading(false);
    };

    fetchQuestionsWithAnswers();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Interview Questions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <ul className="space-y-6">
          {data.map((q) => (
            <li key={q.id} className="p-4 border rounded shadow-sm">
              <p className="text-sm text-gray-500">{new Date(q.created_at).toLocaleString()}</p>
              <h2 className="text-lg font-semibold mb-2">{q.question}</h2>
              <ul className="list-disc list-inside text-gray-700">
                {q.answers.length > 0 ? (
                  q.answers.map((ans, idx) => <li key={idx}>{ans}</li>)
                ) : (
                  <li className="italic text-gray-500">No answers yet</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
*/
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