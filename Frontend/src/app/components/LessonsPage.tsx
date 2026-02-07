import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, BookOpen, MessageCircle, Users, Clock } from 'lucide-react';

const lessons = [
  {
    category: 'Language',
    items: [
      {
        title: 'Basic Arabic Phrases',
        description: 'Learn essential phrases for everyday interactions',
        duration: '15 min',
        difficulty: 'Beginner',
        phrases: ['مرحبا (Marhaba) - Hello', 'شكرا (Shukran) - Thank you', 'كم الثمن؟ (Kam el-thaman?) - How much?'],
      },
      {
        title: 'Egyptian Dialect Basics',
        description: 'Understand the unique Egyptian Arabic dialect',
        duration: '20 min',
        difficulty: 'Beginner',
        phrases: ['ازيك (Izzayak) - How are you?', 'تمام (Tamam) - Good/Okay', 'يلا (Yalla) - Let\'s go'],
      },
    ],
  },
  {
    category: 'Customs',
    items: [
      {
        title: 'Social Etiquette',
        description: 'Navigate social situations with confidence',
        duration: '10 min',
        difficulty: 'Beginner',
        tips: ['Remove shoes when entering homes', 'Use right hand for eating and greeting', 'Dress modestly when visiting religious sites'],
      },
      {
        title: 'Dining Customs',
        description: 'Understand Egyptian food culture and table manners',
        duration: '12 min',
        difficulty: 'Beginner',
        tips: ['Tea is offered as a sign of hospitality', 'Sharing food is common', 'Saying "Bismillah" before eating is respectful'],
      },
    ],
  },
  {
    category: 'History',
    items: [
      {
        title: 'Ancient Egypt Overview',
        description: 'Journey through 3000 years of pharaonic history',
        duration: '30 min',
        difficulty: 'Intermediate',
        topics: ['Old Kingdom & Pyramids', 'New Kingdom & Valley of Kings', 'Ptolemaic Dynasty & Cleopatra'],
      },
      {
        title: 'Modern Egypt',
        description: 'From Muhammad Ali to contemporary Egypt',
        duration: '25 min',
        difficulty: 'Intermediate',
        topics: ['British Colonial Period', 'Revolution of 1952', 'Nasser, Sadat & Modern Era'],
      },
    ],
  },
];

export const LessonsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-papyrus-light">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-brown-dark">The Lessons in Egyptians</h1>
              <p className="text-brown-medium text-sm sm:text-base">Learn language, customs, and history to enrich your journey</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="Language" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-papyrus">
            <TabsTrigger value="Language">
              <MessageCircle className="h-4 w-4 mr-2" />
              Language
            </TabsTrigger>
            <TabsTrigger value="Customs">
              <Users className="h-4 w-4 mr-2" />
              Customs
            </TabsTrigger>
            <TabsTrigger value="History">
              <BookOpen className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {lessons.map((category) => (
            <TabsContent key={category.category} value={category.category} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((lesson, index) => (
                  <Card key={index} className="bg-papyrus shadow-md border-brown-medium/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{lesson.title}</CardTitle>
                        <Badge variant="secondary">{lesson.difficulty}</Badge>
                      </div>
                      <CardDescription>{lesson.description}</CardDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {'phrases' in lesson && (
                        <div className="space-y-2">
                          {lesson.phrases.map((phrase, pIndex) => (
                            <div key={pIndex} className="p-3 bg-secondary/50 rounded-md">
                              <p className="text-sm">{phrase}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {'tips' in lesson && (
                        <ul className="space-y-2">
                          {lesson.tips.map((tip, tIndex) => (
                            <li key={tIndex} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {'topics' in lesson && (
                        <div className="space-y-2">
                          {lesson.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="p-3 bg-secondary/50 rounded-md">
                              <p className="text-sm font-medium">{topic}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button className="w-full mt-4">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Lesson
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardHeader>
            <CardTitle>Why Learn?</CardTitle>
            <CardDescription>Understanding Egyptian culture enhances your travel experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Connect Deeper</h4>
                <p className="text-sm text-muted-foreground">
                  Speaking even basic Arabic creates instant connections with locals
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Show Respect</h4>
                <p className="text-sm text-muted-foreground">
                  Understanding customs demonstrates cultural sensitivity
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Enrich Your Journey</h4>
                <p className="text-sm text-muted-foreground">
                  Historical context makes ancient sites come alive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};