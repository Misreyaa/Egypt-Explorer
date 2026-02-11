import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { ShieldAlert, AlertCircle, CheckCircle, Info, Upload, Image as ImageIcon, X } from 'lucide-react';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        // Simulate OCR
        setInputText("Thinking about the mysterious pyramids and how all Egyptians still live like the ancient times... it seems so exotic.");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeText = async (text: string) => {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    return await res.json();
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
            Enter text directly or upload an image of text (like a social media post or article snippet) to identify potential biases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Example: 'I think all Egyptians...' or 'Egypt seems like such an exotic place...'"
                className="min-h-32"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => analyzeText(inputText)} 
                  disabled={!inputText.trim() || isAnalyzing} 
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : (
                    <>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Analyze for Bias
                    </>
                  )}
                </Button>
                {inputText && (
                  <Button variant="ghost" size="icon" onClick={() => setInputText('')}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="md:w-64 space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-32 hover:bg-accent transition-colors relative group">
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt="Uploaded" className="max-h-24 rounded object-cover mb-2" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-background shadow-sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setInputText('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">Text extracted from image</p>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center mb-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Label htmlFor="image-upload" className="cursor-pointer text-xs font-medium text-primary text-center">
                      Upload Image of Text
                    </Label>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">AI will extract the text</p>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Pro Tip</span>
                </div>
                <p className="text-[10px] text-blue-800 leading-tight">
                  Take a screenshot of news or social media to see if it contains Orientalist framing.
                </p>
              </div>
            </div>
          </div>
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

      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10">
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
