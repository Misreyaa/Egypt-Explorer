import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, CheckCircle2, Star, X, Award } from 'lucide-react';
import { LessonItem } from './LessonsPage';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface LessonDetailPageProps {
  lesson: LessonItem;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizData: Record<string, QuizQuestion[]> = {
  'Beginner: Essential Greetings': [
    {
      question: 'What does "Sabah el kher" mean?',
      options: ['Good evening', 'Good morning', 'Thank you', 'Welcome'],
      correctAnswer: 1
    },
    {
      question: 'Why are greetings particularly important in Egyptian culture?',
      options: [
        'They are just a formality',
        'They show respect and build rapport',
        'They are only used in business',
        'They are optional'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is the most common way to say hello in Egypt?',
      options: ['Marhaba', 'Salam', 'Shukran', 'Afwan'],
      correctAnswer: 1
    }
  ],
  'Intermediate: Market & Haggling': [
    {
      question: 'What does "Ghalia awi" mean?',
      options: ['Very cheap', 'Too expensive', 'Final price', 'Thank you'],
      correctAnswer: 1
    },
    {
      question: 'How is haggling viewed in traditional Egyptian markets?',
      options: [
        'As disrespectful',
        'As a social game between buyer and seller',
        'As unnecessary',
        'As only for tourists'
      ],
      correctAnswer: 1
    },
    {
      question: 'What should you never do when shopping in a souk?',
      options: [
        'Ask for a discount',
        'Accept the first price',
        'Be polite',
        'Walk away'
      ],
      correctAnswer: 1
    }
  ],
  'Advanced: Nuanced Expressions': [
    {
      question: 'What does "Bukra fil mishmish" literally translate to?',
      options: [
        'Tomorrow is a new day',
        'Tomorrow when apricots bloom',
        'See you tomorrow',
        'Maybe tomorrow'
      ],
      correctAnswer: 1
    },
    {
      question: 'When an Egyptian says "Ala rasi," what do they mean?',
      options: [
        'On my head (I refuse)',
        'On my head (With pleasure)',
        'I don\'t understand',
        'Please repeat'
      ],
      correctAnswer: 1
    },
    {
      question: 'What is "Maalesh" commonly used for?',
      options: [
        'Only for serious apologies',
        'Only when asking questions',
        'As a universal balm for any situation',
        'Only in formal settings'
      ],
      correctAnswer: 2
    }
  ]
};

export const LessonDetailPage: React.FC<LessonDetailPageProps> = ({ lesson, onBack }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = quizData[lesson.title] || [];

  const handleComplete = () => {
    if (quizQuestions.length > 0) {
      setShowQuiz(true);
      setCurrentQuestion(0);
      setSelectedAnswers([]);
      setShowResults(false);
    } else {
      toast.success(`Congratulations! You've completed the "${lesson.title}" lesson.`);
      onBack();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show results
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    if (showResults) {
      const score = calculateScore();
      if (score >= 2) {
        toast.success(`Congratulations! You've completed the "${lesson.title}" lesson with ${score}/3 correct!`);
      }
      onBack();
    }
  };

  const score = calculateScore();
  const percentage = Math.round((score / quizQuestions.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>

        <Card className="bg-card shadow-xl border-border overflow-hidden">
          <div className="h-4 w-full bg-pine-primary" />
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="outline" className="border-pine-primary text-pine-primary uppercase tracking-wider text-[10px] px-3">
                {lesson.difficulty} Level
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-pine-primary" />
                <span>{lesson.duration} Full Study</span>
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">{lesson.title}</CardTitle>
              <CardDescription className="text-lg mt-2 italic text-muted-foreground/80">{lesson.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-12 py-8">
            
            {/* Introductory Section */}
            <div className="p-6 bg-brown-light/10 border-l-4 border-brown-dark rounded-r-xl">
              <h3 className="text-xl font-bold text-brown-dark mb-2">Lesson Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to this comprehensive 30-minute guide. This lesson is designed to go beyond surface-level information, 
                enriching your cultural understanding of Egypt through deep dives into {lesson.title.toLowerCase()} and practical applications.
              </p>
            </div>

            {/* Structured Sections */}
            <div className="space-y-12">
              {lesson.sections.map((section, sIndex) => (
                <div key={sIndex} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brown-dark text-papyrus-light rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      {sIndex + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-brown-dark">{section.title}</h3>
                  </div>
                  
                  <div className="prose prose-brown max-w-none ml-2 sm:ml-12">
                    <p className="text-foreground/90 text-lg leading-relaxed">
                      {section.content}
                    </p>
                    
                    {section.details && (
                      <div className="mt-6 grid gap-4">
                        {section.details.map((detail, dIndex) => (
                          <div key={dIndex} className="flex gap-4 p-4 bg-papyrus/40 rounded-xl border border-brown-medium/10">
                            <CheckCircle2 className="h-6 w-6 text-pine-primary shrink-0" />
                            <p className="text-brown-dark/90 font-medium">{detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vocabulary / Bonus Content */}
            {lesson.vocabulary && (
              <div className="p-8 bg-pine-primary/5 rounded-3xl border border-pine-primary/20 space-y-6">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-pine-primary fill-current" />
                  <h3 className="text-xl font-bold text-pine-primary">Knowledge Bank: Vocabulary</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {lesson.vocabulary.map((vocab, vIndex) => (
                    <div key={vIndex} className="p-4 bg-white/60 rounded-2xl border border-pine-primary/10 shadow-sm flex flex-col">
                      <span className="text-lg font-bold text-pine-dark">{vocab.word}</span>
                      <span className="text-sm text-muted-foreground">{vocab.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Section */}
            <div className="pt-8 border-t border-border flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-pine-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-pine-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">Ready to move on?</h4>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Take a quick 3-question quiz to test your knowledge and complete this lesson.
              </p>
              <Button 
                onClick={handleComplete}
                className="bg-pine-primary hover:bg-pine-dark text-white px-10 py-6 rounded-full text-lg shadow-lg w-full sm:w-auto"
              >
                Take Quiz & Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="sm:max-w-2xl bg-card">
          {!showResults ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Question {currentQuestion + 1} of {quizQuestions.length}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Choose the best answer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <p className="text-lg font-medium text-foreground">
                  {quizQuestions[currentQuestion]?.question}
                </p>
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                >
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion]?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={handleCloseQuiz}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="bg-pine-primary hover:bg-pine-dark text-white"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Award className="h-6 w-6 text-pine-primary" />
                  Quiz Complete!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                    percentage >= 66 ? 'bg-pine-primary/20' : percentage >= 33 ? 'bg-amber-500/20' : 'bg-red-900/20'
                  }`}>
                    <span className={`text-4xl font-bold ${
                      percentage >= 66 ? 'text-pine-primary' : percentage >= 33 ? 'text-amber-600' : 'text-red-900'
                    }`}>
                      {score}/{quizQuestions.length}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground mb-2">
                      {percentage >= 66 ? 'Excellent Work!' : percentage >= 33 ? 'Good Effort!' : 'Keep Learning!'}
                    </p>
                    <p className="text-muted-foreground">
                      You scored {percentage}% on this quiz
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {quizQuestions.map((q, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      selectedAnswers[index] === q.correctAnswer 
                        ? 'border-pine-primary bg-pine-primary/5' 
                        : 'border-red-900 bg-red-900/5'
                    }`}>
                      <div className="flex items-start gap-3">
                        {selectedAnswers[index] === q.correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-pine-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-red-900 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm mb-1">{q.question}</p>
                          <p className="text-sm text-muted-foreground">
                            Correct answer: {q.options[q.correctAnswer]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleCloseQuiz}
                  className="bg-pine-primary hover:bg-pine-dark text-white"
                >
                  {score >= 2 ? 'Complete Lesson' : 'Close'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};