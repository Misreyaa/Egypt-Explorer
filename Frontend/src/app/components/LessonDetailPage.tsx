import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, CheckCircle2, Star } from 'lucide-react';
import { LessonItem } from './LessonsPage';
import { toast } from 'sonner';

interface LessonDetailPageProps {
  lesson: LessonItem;
  onBack: () => void;
}

export const LessonDetailPage: React.FC<LessonDetailPageProps> = ({ lesson, onBack }) => {
  const handleComplete = () => {
    toast.success(`Congratulations! You've completed the "${lesson.title}" lesson.`);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-brown-dark hover:bg-brown-light/20"
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
              <CardTitle className="text-3xl font-bold text-brown-dark">{lesson.title}</CardTitle>
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
            <div className="pt-8 border-t border-brown-medium/10 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-pine-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-pine-primary" />
              </div>
              <h4 className="text-xl font-bold text-brown-dark mb-2">Ready to move on?</h4>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Mark this lesson as complete to track your progress and unlock more advanced cultural guides.
              </p>
              <Button 
                onClick={handleComplete}
                className="bg-pine-primary hover:bg-pine-dark text-white px-10 py-6 rounded-full text-lg shadow-lg w-full sm:w-auto"
              >
                Complete Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
