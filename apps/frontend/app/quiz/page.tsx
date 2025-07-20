'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Star, Home, Ship, Wrench, ArrowRight, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL } from '@/lib/api';

// Types
type QuizType = 'name' | 'builder' | 'mixed';

interface QuizQuestion {
  yacht: {
    name: string;
    yacht_picture: string;
    builder: string;
    length_m: number;
    year_built: number;
    volume_gt: number;
    max_speed_kn: number;
    detail_url: string;
    beam_m: number;
    exterior_designer: string;
    interior_designer: string;
    naval_architect: string;
    sale_info: string;
  };
  options: string[];
  correctAnswer: string;
  questionId: string;
  questionType: QuizType;
}

interface QuizStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export default function YachtQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<QuizStats>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [quizType, setQuizType] = useState<QuizType>('mixed');
  const [lengthRange, setLengthRange] = useState([30, 180]);
  const [committedLengthRange, setCommittedLengthRange] = useState([30, 180]);

  const fetchQuestions = useCallback(async (type: QuizType, min?: string, max?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (min) params.set('minLength', min);
      if (max) params.set('maxLength', max);
            const response = await fetch(`${API_URL}/api/quiz?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch questions.');
      const data = await response.json();
      if (data.success) {
        setQuestions(prev => [...prev, ...data.questions]);
      } else {
        throw new Error(data.error || 'Failed to parse questions data.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setStats({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

    if (Array.isArray(committedLengthRange) && committedLengthRange.length === 2) {
      const [min, max] = committedLengthRange;
      if (typeof min === 'number' && typeof max === 'number') {
        fetchQuestions(quizType, min.toString(), max.toString());
      }
    }
  }, [fetchQuestions, quizType, committedLengthRange]);

  const handleAnswerSelect = (answer: string) => {
    const question = questions[currentQuestionIndex];
    if (showResult || !question) return;

    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    setStats(prev => {
      const newTotal = prev.total + 1;
      const newCorrect = prev.correct + (correct ? 1 : 0);
      const newStreak = correct ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      return { correct: newCorrect, total: newTotal, streak: newStreak, bestStreak: newBestStreak };
    });
  };

  const handleNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsImageLoading(true);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex === questions.length) {
      fetchQuestions(quizType, lengthRange[0]!.toString(), lengthRange[1]!.toString());
    }
    setCurrentQuestionIndex(nextIndex);
  }, [currentQuestionIndex, questions.length, fetchQuestions, quizType, lengthRange]);

  useEffect(() => {
    handleStartQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizType, committedLengthRange]);

  const question = questions[currentQuestionIndex];
  const progressValue = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Yacht Quiz</h1>
          <Button variant="outline" size="icon" asChild>
            <Link href="/"><Home className="h-4 w-4" /></Link>
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz Type</label>
              <Select value={quizType} onValueChange={(value: QuizType) => setQuizType(value)}>
                <SelectTrigger><SelectValue placeholder="Select quiz type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed"><Ship className="inline-block mr-2 h-4 w-4" />Mixed</SelectItem>
                  <SelectItem value="name"><Ship className="inline-block mr-2 h-4 w-4" />Name</SelectItem>
                  <SelectItem value="builder"><Wrench className="inline-block mr-2 h-4 w-4" />Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="lengthRange" className="text-sm font-medium">
                Length Range: {lengthRange[0]}m - {lengthRange[1]}m
              </label>
              <Slider
                id="lengthRange"
                min={20}
                max={200}
                step={5}
                value={lengthRange}
                onValueChange={setLengthRange}
                onValueCommit={setCommittedLengthRange}
                className="pt-2"
              />
            </div>
          </div>

        </Card>

        {error && (
          <Alert variant="destructive" className="max-w-md mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !question ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Quiz...</p>
          </div>
        ) : question ? (
          <>
            <div className="w-full max-w-2xl mb-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge variant="outline">Score: {stats.correct} / {stats.total}</Badge>
                <Badge variant="outline"><Star className="mr-1 h-3 w-3" />Streak: {stats.streak}</Badge>
                <Badge variant="outline"><Star className="mr-1 h-3 w-3 text-yellow-400" />Best: {stats.bestStreak}</Badge>
              </div>
              <Progress value={progressValue} className="w-full" />
            </div>
            <div className="mt-4" />

            {question && (
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    {(isImageLoading || !question?.yacht.yacht_picture) && <Skeleton className="absolute inset-0 w-full h-full" />}
                    {question?.yacht.yacht_picture && (
                      <Image
                        key={question?.questionId}
                        src={question?.yacht.yacht_picture}
                        alt={`Quiz yacht: ${question?.yacht.name}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => handleNextQuestion()} // Skip on image error
                        className={cn('transition-opacity duration-300', isImageLoading ? 'opacity-0' : 'opacity-100')}
                        priority
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">
                    {question?.questionType === 'builder' ? 'Which builder made this yacht?' : 'Which yacht is this?'}
                  </CardTitle>
                  <CardDescription>Select the correct name from the options below.</CardDescription>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {question?.options?.map((option) => {
                      const isCorrectAnswer = option === question?.correctAnswer;
                      const isSelected = option === selectedAnswer;
                      return (
                        <Button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={showResult}
                          variant={showResult && (isCorrectAnswer || isSelected) ? 'default' : 'outline'}
                          className={cn('h-auto justify-start text-left whitespace-normal', {
                            'bg-green-600 hover:bg-green-700 text-white': showResult && isCorrectAnswer,
                            'bg-red-600 hover:bg-red-700 text-white': showResult && isSelected && !isCorrectAnswer,
                            'border-muted-foreground': showResult && !isSelected && !isCorrectAnswer,
                          })}
                        >
                          {showResult && isCorrectAnswer && <CheckCircle2 className="mr-2 h-5 w-5" />}
                          {showResult && isSelected && !isCorrectAnswer && <XCircle className="mr-2 h-5 w-5" />}
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {showResult && (
              <div className="mt-6 text-center w-full max-w-2xl">
                <Alert className={cn(isCorrect ? 'border-green-500' : 'border-red-500')}>
                  <AlertTitle className="flex items-center gap-2">
                    {isCorrect ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </AlertTitle>
                  <AlertDescription>
                    {isCorrect ? 'Well done!' : `The correct answer was ${question?.correctAnswer}.`}
                    <div className="mt-4 flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">Yacht Name: {question?.yacht.name}</Badge>
                      <Badge variant="secondary">Builder: {question?.yacht.builder}</Badge>
                      <Badge variant="secondary">Length: {question?.yacht.length_m}m</Badge>
                      <Badge variant="secondary">Year Built: {question?.yacht.year_built}</Badge>
                      <Badge variant="secondary">Volume: {question?.yacht.volume_gt} GT</Badge>
                      <Badge variant="secondary">Max Speed: {question?.yacht.max_speed_kn} kn</Badge>
                      <Badge variant="secondary">Exterior Designer: {question?.yacht.exterior_designer}</Badge>
                      <Badge variant="secondary">Interior Designer: {question?.yacht.interior_designer}</Badge>
                      <Badge variant="secondary">Naval Architect: {question?.yacht.naval_architect}</Badge>


                    </div>

                    <a href={question?.yacht.detail_url} target="_blank" rel="noopener noreferrer">
                      <Button>More Info <ExternalLink className="ml-2 h-4 w-4" /></Button>
                    </a>
                  </AlertDescription>
                </Alert>
                <Button onClick={handleNextQuestion} className="mt-4 w-full md:w-auto">
                  Next Question <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
