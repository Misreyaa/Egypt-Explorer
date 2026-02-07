import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { HelpCircle, Phone, Mail, MessageSquare, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const faqs = [
  {
    question: 'What is the best time to visit Egypt?',
    answer: 'The best time to visit Egypt is from October to April when temperatures are cooler (20-25°C). Summer (May-September) can be extremely hot (35-45°C), especially in southern areas like Luxor and Aswan.',
  },
  {
    question: 'Do I need a visa to visit Egypt?',
    answer: 'Most nationalities can obtain a visa on arrival at Egyptian airports or apply for an e-visa online before travel. Check with your local Egyptian embassy for specific requirements based on your nationality.',
  },
  {
    question: 'Is Egypt safe for tourists?',
    answer: 'Major tourist areas in Egypt are generally safe. Follow standard travel precautions, stay in tourist-friendly areas, use registered guides, and follow local advice. Check your government\'s travel advisories before booking.',
  },
  {
    question: 'What currency is used in Egypt?',
    answer: 'The Egyptian Pound (EGP) is the official currency. ATMs are widely available in cities. Credit cards are accepted in major hotels and restaurants, but cash is preferred in markets and smaller establishments.',
  },
  {
    question: 'How should I dress in Egypt?',
    answer: 'Dress modestly, especially when visiting religious sites. Women should cover shoulders and knees. Men should avoid sleeveless shirts at religious sites. Beachwear is acceptable at resorts and beaches.',
  },
  {
    question: 'What vaccinations do I need?',
    answer: 'Routine vaccinations should be up to date. Hepatitis A and Typhoid are recommended. Consult your doctor or travel clinic at least 4-6 weeks before travel for personalized advice.',
  },
  {
    question: 'Can I drink tap water in Egypt?',
    answer: 'It\'s recommended to drink bottled water throughout your stay. Avoid ice in drinks unless you\'re sure it\'s made from filtered water. Most hotels provide complimentary bottled water.',
  },
  {
    question: 'What language is spoken in Egypt?',
    answer: 'Arabic is the official language. English is widely spoken in tourist areas, hotels, and by guides. Learning a few basic Arabic phrases is appreciated by locals.',
  },
];

const emergencyContacts = [
  { service: 'Tourist Police', number: '126', icon: Phone },
  { service: 'Ambulance', number: '123', icon: Phone },
  { service: 'Fire Department', number: '180', icon: Phone },
  { service: 'General Emergency', number: '122', icon: Phone },
];

export const HelpPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1>Help Me</h1>
            <p className="text-muted-foreground">Get answers to common questions and emergency assistance</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find quick answers to common travel questions</CardDescription>
            <div className="mt-4">
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No FAQs found. Try a different search term.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>Important numbers to save</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">{contact.service}</span>
                    </div>
                    <span className="text-sm font-bold text-red-700">{contact.number}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Egypt is GMT+2 (no daylight saving)</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Download offline maps before traveling</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Local SIM cards are cheap and widely available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message and we'll get back to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formSubmitted && (
            <Alert className="mb-4">
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Thank you! Your message has been sent. We'll respond within 24 hours.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="What do you need help with?" required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your question or issue in detail..."
                className="min-h-32"
                required
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Phone className="h-6 w-6 mb-2" />
              <span className="font-semibold">24/7 Hotline</span>
              <span className="text-xs text-muted-foreground">+20 2 1234 5678</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span className="font-semibold">Email Support</span>
              <span className="text-xs text-muted-foreground">help@egyptexplorer.com</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              <span className="font-semibold">Live Chat</span>
              <span className="text-xs text-muted-foreground">Available 9 AM - 6 PM</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
