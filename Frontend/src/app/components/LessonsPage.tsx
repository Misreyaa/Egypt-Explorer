import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, BookOpen, MessageCircle, Users, Clock } from 'lucide-react';

export interface LessonSection {
  title: string;
  content: string;
  details?: string[];
}

export interface VocabularyItem {
  word: string;
  meaning: string;
}

export interface LessonItem {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  sections: LessonSection[];
  vocabulary?: VocabularyItem[];
  phrases?: string[];
  tips?: string[];
  topics?: string[];
}

const lessons = [
  {
    category: 'Language',
    items: [
      {
        title: 'Beginner: Essential Greetings',
        description: 'Master the foundation of Egyptian communication.',
        duration: '30 min',
        difficulty: 'Beginner',
        sections: [
          {
            title: 'The Importance of Greetings',
            content: 'In Egypt, greetings are more than just a formality; they are a bridge to building rapport and showing respect. Skipping a greeting can be seen as cold or dismissive.',
            details: ['Always greet everyone when entering a room', 'Eye contact is important during greetings', 'Smile - it is universal']
          },
          {
            title: 'Common Phrases in Context',
            content: 'Learn how to use these phrases naturally in daily life.',
            details: ['Salam (Peace) - The most common way to say hello', 'Sabah el kher (Morning of goodness) - Good morning', 'Ahlan wa sahlan - Welcome']
          }
        ],
        vocabulary: [
          { word: 'Marhaba', meaning: 'Hello' },
          { word: 'Shukran', meaning: 'Thank you' },
          { word: 'Afwan', meaning: 'You are welcome / Excuse me' }
        ]
      },
      {
        title: 'Intermediate: Market & Haggling',
        description: 'Learn the art of negotiation in the bustling souks.',
        duration: '30 min',
        difficulty: 'Intermediate',
        sections: [
          {
            title: 'The Psychology of the Souk',
            content: 'Haggling is an expected part of the shopping experience in traditional Egyptian markets. It is treated as a social game between buyer and seller.',
            details: ['Never accept the first price', 'Stay polite and keep it friendly', 'Know when to walk away']
          },
          {
            title: 'Numbers and Bargaining Phrases',
            content: 'Master the numbers and specific phrases that show you are an informed buyer.',
            details: ['Ghalia awi! (Too expensive!)', 'Akher kalam? (Final word?)', 'Momken khasem? (Can I get a discount?)']
          }
        ],
        vocabulary: [
          { word: 'Kalam', meaning: 'Words / Talk' },
          { word: 'Floos', meaning: 'Money' },
          { word: 'Siaer', meaning: 'Price' }
        ]
      },
      {
        title: 'Advanced: Nuanced Expressions',
        description: 'Understand deep cultural idioms and emotional language.',
        duration: '30 min',
        difficulty: 'Advanced',
        sections: [
          {
            title: 'Cultural Idioms',
            content: 'Egyptian Arabic is rich with metaphors that reflect the history and values of the people.',
            details: ['Bukra fil mishmish (Tomorrow when apricots bloom) - Means "Never"', 'Ala rasi (On my head) - Means "With pleasure"', 'Maalesh (Nevermind/Sorry) - The universal Egyptian balm for any situation']
          }
        ],
        vocabulary: [
          { word: 'Ya habibi', meaning: 'My dear (can be used for friends, family, or even strangers)' },
          { word: 'Insha\'Allah', meaning: 'God willing (used for future plans)' }
        ]
      }
    ]
  },
  {
    category: 'Customs',
    items: [
      {
        title: 'Beginner: Daily Etiquette',
        description: 'Fundamental social rules for a respectful visit.',
        duration: '30 min',
        difficulty: 'Beginner',
        sections: [
          {
            title: 'The Right Hand Rule',
            content: 'The right hand is used for eating, shaking hands, and giving or receiving items. The left hand is traditionally considered unclean.',
            details: ['Pass money with your right hand', 'Accept food with your right hand']
          }
        ]
      },
      {
        title: 'Intermediate: Guest & Host',
        description: 'Deep dive into Egyptian hospitality and home visits.',
        duration: '30 min',
        difficulty: 'Intermediate',
        sections: [
          {
            title: 'Entering an Egyptian Home',
            content: 'Being invited to an Egyptian home is a great honor. There are specific expectations for both guests and hosts.',
            details: ['Always remove your shoes', 'Bring a small gift (chocolates or fruit)', 'Expect to be fed until you are very full']
          }
        ]
      },
      {
        title: 'Advanced: Deep Cultural Values',
        description: 'Understanding honor, family, and religious harmony.',
        duration: '30 min',
        difficulty: 'Advanced',
        sections: [
          {
            title: 'The Role of Family',
            content: 'Family is the central unit of Egyptian society, providing a support network that defines much of daily life.',
            details: ['Respect for elders is paramount', 'Collective decision making is common']
          }
        ]
      }
    ]
  },
  {
    category: 'History',
    items: [
      {
        title: 'Beginner: Dynastic Timeline',
        description: 'An overview of the major periods of Ancient Egypt.',
        duration: '30 min',
        difficulty: 'Beginner',
        sections: [
          {
            title: 'The Three Kingdoms',
            content: 'Egyptian history is traditionally divided into the Old, Middle, and New Kingdoms, separated by "Intermediate Periods" of chaos.',
            details: ['Old Kingdom: The Pyramid Builders', 'Middle Kingdom: The Golden Age of Literature', 'New Kingdom: The Imperial Age']
          }
        ]
      },
      {
        title: 'Intermediate: Gods & Religion',
        description: 'Exploring the complex pantheon and the concept of Ma\'at.',
        duration: '30 min',
        difficulty: 'Intermediate',
        sections: [
          {
            title: 'The Concept of Ma\'at',
            content: 'Ma\'at was the ancient Egyptian concept of truth, balance, order, and justice. It was the fundamental principle that guided life and the afterlife.',
            details: ['Ra - The Sun God', 'Osiris - The God of the Afterlife', 'Isis - The Mother Goddess']
          }
        ]
      },
      {
        title: 'Advanced: Modern Transformation',
        description: 'From the colonial era to the Arab Spring and beyond.',
        duration: '30 min',
        difficulty: 'Advanced',
        sections: [
          {
            title: 'The 1952 Revolution',
            content: 'The end of the monarchy and the rise of Arab Nationalism under Gamal Abdel Nasser reshaped modern Egypt.',
            details: ['Suez Canal Crisis', 'Construction of the High Dam', 'Rise of Pan-Arabism']
          }
        ]
      }
    ]
  }
];

interface LessonsPageProps {
  onStartLesson: (lesson: LessonItem) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({ onStartLesson }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-brown-dark rounded-full flex items-center justify-center shadow-lg border border-brown-medium/30">
              <GraduationCap className="h-6 w-6 text-papyrus-light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">The Lessons in Egyptians</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Learn language, customs, and history to enrich your journey</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="Language" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-brown-light/20">
            <TabsTrigger value="Language" className="data-[state=active]:bg-brown-dark data-[state=active]:text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Language
            </TabsTrigger>
            <TabsTrigger value="Customs" className="data-[state=active]:bg-brown-dark data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Customs
            </TabsTrigger>
            <TabsTrigger value="History" className="data-[state=active]:bg-brown-dark data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {lessons.map((category) => (
            <TabsContent key={category.category} value={category.category} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((lesson, index) => (
                  <Card key={index} className="bg-card shadow-md border-border hover:border-pine-primary/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl text-brown-dark">{lesson.title}</CardTitle>
                        <Badge variant="secondary" className="bg-papyrus border-brown-medium/20 text-brown-dark">{lesson.difficulty}</Badge>
                      </div>
                      <CardDescription>{lesson.description}</CardDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4 text-pine-primary" />
                        <span>{lesson.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[100px]">
                        {'phrases' in lesson && (
                          <div className="space-y-2">
                            {lesson.phrases?.slice(0, 2).map((phrase, pIndex) => (
                              <div key={pIndex} className="p-2 bg-papyrus/40 rounded-md border border-brown-medium/5">
                                <p className="text-sm italic">{phrase}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {'tips' in lesson && (
                          <ul className="space-y-2">
                            {lesson.tips?.slice(0, 2).map((tip, tIndex) => (
                              <li key={tIndex} className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-pine-primary mt-2 shrink-0" />
                                <span className="text-sm">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {'topics' in lesson && (
                          <div className="space-y-2">
                            {lesson.topics?.slice(0, 2).map((topic, topicIndex) => (
                              <div key={topicIndex} className="p-2 bg-papyrus/40 rounded-md border border-brown-medium/5">
                                <p className="text-sm font-medium">{topic}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-6 bg-pine-primary hover:bg-pine-dark"
                        onClick={() => onStartLesson(lesson as LessonItem)}
                      >
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

        <Card className="mt-6 sm:mt-8 bg-brown-dark text-papyrus-light border-none shadow-xl">
          <CardHeader>
            <CardTitle>Why Learn?</CardTitle>
            <CardDescription className="text-papyrus/70">Understanding Egyptian culture enhances your travel experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold mb-2 text-pine-primary">Connect Deeper</h4>
                <p className="text-sm opacity-80">
                  Speaking even basic Arabic creates instant connections with locals
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold mb-2 text-pine-primary">Show Respect</h4>
                <p className="text-sm opacity-80">
                  Understanding customs demonstrates cultural sensitivity
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold mb-2 text-pine-primary">Enrich Your Journey</h4>
                <p className="text-sm opacity-80">
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