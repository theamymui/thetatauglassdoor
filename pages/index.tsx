import  supabase  from '../supabase';
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
