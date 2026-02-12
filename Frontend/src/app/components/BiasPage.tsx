import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Image as ImageIcon, 
  X, 
  BarChart3, 
  Fingerprint, 
  Lightbulb,
  Zap,
  RotateCcw
} from 'lucide-react';

// --- Interfaces ---

interface DetailedBias {
  type: string;
  note: string;
}

interface AnalysisResponse {
  hasBias: boolean;
  biasPercentage: number;
  biasLevel: number;
  biasLabel: string;
  summary: string;
  biases: DetailedBias[];
  context: string;
}

// --- Constants & Mock Data ---

const metrics = [
  { level: 1, label: 'Objective', range: '0–20%', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { level: 2, label: 'Opinionated', range: '21–40%', color: 'bg-sky-500', text: 'text-sky-600' },
  { level: 3, label: 'Leaning', range: '41–60%', color: 'bg-amber-500', text: 'text-amber-600' },
  { level: 4, label: 'Biased', range: '61–80%', color: 'bg-orange-500', text: 'text-orange-600' },
  { level: 5, label: 'Highly Biased', range: '81–100%', color: 'bg-red-500', text: 'text-red-500' },
];

const mockOutputs: AnalysisResponse[] = [
  {
    hasBias: false,
    biasPercentage: 12,
    biasLevel: 1,
    biasLabel: "Objective",
    summary: "The text provides a factual historical account of Egyptian architecture.",
    biases: [],
    context: "Keep using specific dates and archaeological evidence to maintain this level of objectivity."
  },
  {
    hasBias: true,
    biasPercentage: 55,
    biasLevel: 3,
    biasLabel: "Leaning",
    summary: "The content shifts from factual reporting to subjective descriptions of lifestyle.",
    biases: [
      { type: "Generalization", note: "Assuming traditional dress is the standard for all modern Egyptians." }
    ],
    context: "Try to acknowledge the urban-rural divide to provide a more balanced view."
  },
  {
    hasBias: true,
    biasPercentage: 88,
    biasLevel: 5,
    biasLabel: "Highly Biased",
    summary: "The text heavily relies on Orientalist tropes and 'mystical' framing of a modern nation.",
    biases: [
      { type: "Orientalism", note: "Framing Egypt as a 'land of mystery' rather than a contemporary state." },
      { type: "Stereotyping", note: "Portraying citizens as living primarily in the past." }
    ],
    context: "Replace exoticized adjectives with contemporary socioeconomic descriptions."
  }
];

export const BiasPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- Helpers ---

  const getMetricData = (level: number) => {
    return metrics.find(m => m.level === level) || metrics[0];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- New Backend Analysis Function ---
  const runAnalysis = async () => {
    const text = inputText.trim();
    const hasImage = !!selectedImage;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      let res: Response;
      if (hasImage && selectedImage) {
        // Send multipart: image file + optional text
        const formData = new FormData();
        if (text) formData.append('text', text);
        const blob = await (await fetch(selectedImage)).blob();
        const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpeg';
        formData.append('image', blob, `upload.${ext}`);

        res = await fetch('http://127.0.0.1:8080/analyze', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text-only or empty
        res = await fetch('http://127.0.0.1:8080/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text || '' }),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error('Analyze failed:', res.status, errText);
        setIsAnalyzing(false);
        return;
      }

      const data = await res.json();
      console.log('Analyze response:', data);

      const biasLevel = typeof data.biasLevel === 'number' ? data.biasLevel : 1;
      const mappedBiases: DetailedBias[] = (data.biases || []).map((b: { type?: string; note?: string }) => ({
        type: b.type || 'Bias',
        note: b.note || '',
      }));

      setAnalysis({
        hasBias: data.hasBias ?? mappedBiases.length > 0,
        biasPercentage: data.biasPercentage ?? 0,
        biasLevel,
        biasLabel: data.biasLabel || biasLevelToLabel(biasLevel),
        summary: data.summary || data.context || '',
        biases: mappedBiases,
        context: data.context || '',
      });
    } catch (err) {
      console.error('Analyze request error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const biasLevelToLabel = (level: number) => {
    const metric = getMetricData(level);
    return metric?.label || 'Objective';
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Bias Detector</h1>
            <p className="text-muted-foreground text-sm">Review cultural framing and objectivity</p>
          </div>
        </div>
        {(analysis || inputText) && (
          <Button variant="ghost" size="sm" onClick={() => { setAnalysis(null); setInputText(''); setSelectedImage(null); }} className="text-muted-foreground">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Input Section */}
      <Card className="mb-8 border-border shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Content Input</CardTitle>
          <CardDescription>Enter text or upload an image to analyze.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Type something here..."
                className="min-h-32 resize-none focus-visible:ring-primary bg-input-background"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing || (!inputText.trim() && !selectedImage)} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-[0.98]"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze for Bias'}
              </Button>
            </div>
            
            <div className="md:w-64">
              <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[176px] hover:border-primary/50 transition-colors relative bg-muted/20">
                {selectedImage ? (
                  <div className="text-center">
                    <img src={selectedImage} alt="Uploaded" className="max-h-24 rounded shadow-sm mb-2 mx-auto" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => { setSelectedImage(null); setInputText(''); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center group">
                    <div className="h-10 w-10 bg-background border border-border rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Upload Content</span>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <Card className={`overflow-hidden border-border shadow-xl bg-card`}>
            {/* Accent Bar */}
            <div className={`h-2.5 ${getMetricData(analysis.biasLevel).color} transition-colors duration-500`} />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="secondary" className={`${getMetricData(analysis.biasLevel).text} bg-secondary shadow-sm border-none px-3 py-1`}>
                    Level {analysis.biasLevel}: {analysis.biasLabel}
                  </Badge>
                  <CardTitle className="text-2xl font-black pt-2 text-foreground">Analysis Results</CardTitle>
                </div>
                <div className="bg-muted p-3 rounded-xl border border-border text-center min-w-[100px]">
                  <span className={`text-3xl font-black block ${getMetricData(analysis.biasLevel).text}`}>
                    {analysis.biasPercentage}%
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Bias Score</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <div className="bg-muted/50 border border-border p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Fingerprint className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-1">Specific Indicators</h4>
                {analysis.biases.length > 0 ? (
                  <div className="grid gap-3">
                    {analysis.biases.map((bias, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                        <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${getMetricData(analysis.biasLevel).color} bg-opacity-10`}>
                          <AlertCircle className={`h-4 w-4 ${getMetricData(analysis.biasLevel).text}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{bias.type}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bias.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                    <CheckCircle className="h-5 w-5" />
                    <p className="text-xs font-bold uppercase">No Bias Detected</p>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-tight mb-1">Perspective Strategy</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">{analysis.context}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
