import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { ShieldAlert, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface BiasCheck {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

const commonBiases: BiasCheck[] = [
  {
    type: 'Stereotyping',
    severity: 'high',
    description: 'Making generalizations about Egyptian people or culture',
    suggestion: 'Recognize the diversity within Egyptian society - not all Egyptians share the same beliefs, practices, or lifestyles.',
  },
  {
    type: 'Orientalism',
    severity: 'high',
    description: 'Viewing Egypt as exotic or mysterious rather than as a modern nation',
    suggestion: 'Egypt is a contemporary society with modern cities, technology, and diverse perspectives, not just ancient monuments.',
  },
  {
    type: 'Economic Assumptions',
    severity: 'medium',
    description: 'Assuming all Egyptians face economic hardship',
    suggestion: 'Egypt has a diverse economy with wealthy, middle-class, and working-class populations.',
  },
  {
    type: 'Religious Oversimplification',
    severity: 'medium',
    description: 'Assuming homogeneous religious beliefs',
    suggestion: 'While majority Muslim, Egypt has significant Christian communities and diverse interpretations of faith.',
  },
];

export const BiasPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<BiasCheck[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeText = () => {
    // Simulated bias detection - in real app, this would use AI/NLP
    const detectedBiases: BiasCheck[] = [];

    const lowerText = inputText.toLowerCase();

    if (lowerText.includes('exotic') || lowerText.includes('mysterious') || lowerText.includes('ancient land')) {
      detectedBiases.push(commonBiases[1]);
    }

    if (lowerText.includes('all egyptians') || lowerText.includes('they all')) {
      detectedBiases.push(commonBiases[0]);
    }

    if (lowerText.includes('poor') || lowerText.includes('poverty') && !lowerText.includes('some')) {
      detectedBiases.push(commonBiases[2]);
    }

    if ((lowerText.includes('muslim') || lowerText.includes('islamic')) && lowerText.includes('all')) {
      detectedBiases.push(commonBiases[3]);
    }

    setResults(detectedBiases);
    setAnalyzed(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1>Bias Detector</h1>
            <p className="text-muted-foreground">Check your perspectives and learn to approach Egyptian culture with respect</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analyze Your Thoughts</CardTitle>
          <CardDescription>
            Enter any thoughts, assumptions, or questions about Egypt and Egyptian culture. We'll help identify potential biases and provide educational context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: 'I think all Egyptians...' or 'Egypt seems like such an exotic place...'"
            className="min-h-32"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Button onClick={analyzeText} disabled={!inputText.trim()} className="w-full">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Analyze for Bias
          </Button>
        </CardContent>
      </Card>

      {analyzed && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Great! We didn't detect any common biases in your text. Remember to always approach cultures with openness and respect.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We detected {results.length} potential bias{results.length > 1 ? 'es' : ''} in your text. Review the insights below.
                </AlertDescription>
              </Alert>

              {results.map((bias, index) => (
                <Card key={index} className="border-l-4 border-l-destructive">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{bias.type}</CardTitle>
                      <Badge variant={getSeverityColor(bias.severity) as any}>
                        {bias.severity} severity
                      </Badge>
                    </div>
                    <CardDescription>{bias.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Better Perspective:</h4>
                        <p className="text-sm text-muted-foreground">{bias.suggestion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle>Common Biases to Avoid</CardTitle>
          <CardDescription>Learn about cultural sensitivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commonBiases.map((bias, index) => (
              <div key={index} className="flex gap-3">
                <div className="shrink-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    bias.severity === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      bias.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{bias.type}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{bias.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
