import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Upload, 
  Image as ImageIcon, 
  X, 
  BarChart3, 
  Fingerprint, 
  Lightbulb,
  Zap
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

// --- Constants ---

const metrics = [
  { level: 1, label: 'Objective', range: '0–20%', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { level: 2, label: 'Opinionated', range: '21–40%', color: 'bg-sky-500', text: 'text-sky-600' },
  { level: 3, label: 'Leaning', range: '41–60%', color: 'bg-amber-500', text: 'text-amber-600' },
  { level: 4, label: 'Biased', range: '61–80%', color: 'bg-orange-500', text: 'text-orange-600' },
  { level: 5, label: 'Highly Biased', range: '81–100%', color: 'bg-red-600', text: 'text-red-600' },
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
        // Simulate OCR extraction
        setInputText("The mysterious pyramids reveal how Egyptians live in the past, unlike modern societies.");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeText = async (text: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("http://localhost:8080/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analyze request error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cultural Bias Detector</h1>
          <p className="text-muted-foreground text-sm">Analyze perspectives on Egyptian culture for objective framing</p>
        </div>
      </div>

      {/* 1. METRIC EXPLANATION SECTION */}
      <Card className="mb-8 border-none bg-slate-50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Bias Intensity Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {metrics.map((m) => (
              <div key={m.level} className="relative space-y-2">
                <div className={`h-1.5 w-full rounded-full ${m.color} opacity-30`} />
                <div>
                  <p className={`text-xs font-bold ${m.text}`}>{m.label}</p>
                  <p className="text-[10px] text-slate-400">Level {m.level} ({m.range})</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Analyze Content</CardTitle>
          <CardDescription>Paste text or upload an image to check for Orientalism or stereotypes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Paste article snippet or social media post here..."
                className="min-h-32 resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button 
                onClick={() => analyzeText(inputText)} 
                disabled={!inputText.trim() || isAnalyzing} 
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                {isAnalyzing ? 'Processing...' : (
                  <>
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    Analyze for Bias
                  </>
                )}
              </Button>
            </div>
            
            <div className="md:w-64">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-40 hover:border-primary/50 transition-colors relative">
                {selectedImage ? (
                  <div className="text-center">
                    <img src={selectedImage} alt="Uploaded" className="max-h-28 rounded-lg shadow-sm mb-2" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => { setSelectedImage(null); setInputText(''); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-[10px] font-medium text-slate-500">Image Loaded</p>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="h-5 w-5 text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Upload Image</span>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. DYNAMIC OUTPUT SECTION */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className={`overflow-hidden border-none shadow-lg`}>
            {/* Header Bar color-coded by Level */}
            <div className={`h-2 ${getMetricData(analysis.biasLevel).color}`} />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-end">
                <div>
                  <Badge variant="outline" className={`mb-2 ${getMetricData(analysis.biasLevel).text} border-current`}>
                    Level {analysis.biasLevel}: {analysis.biasLabel}
                  </Badge>
                  <CardTitle className="text-2xl">Analysis Results</CardTitle>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black ${getMetricData(analysis.biasLevel).text}`}>
                    {analysis.biasPercentage}%
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Bias Score</p>
                </div>
              </div>
              <Progress value={analysis.biasPercentage} className="h-3 mt-4 bg-slate-100" />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Summary Box */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3">
                <Fingerprint className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">AI Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{analysis.summary}"</p>
                </div>
              </div>

              {/* Detailed Biases */}
              {analysis.biases.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Detected Patterns</h4>
                  {analysis.biases.map((bias, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${getMetricData(analysis.biasLevel).color} bg-opacity-10`}>
                        <AlertCircle className={`h-4 w-4 ${getMetricData(analysis.biasLevel).text}`} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{bias.type}</p>
                        <p className="text-sm text-slate-500 mt-1">{bias.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">No significant cultural biases detected in this content.</p>
                </div>
              )}

              {/* Context/Advice Box */}
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex gap-3">
                <Lightbulb className="h-5 w-5 text-sky-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-sky-900 mb-1">Helpful Context</h4>
                  <p className="text-sm text-sky-800 leading-relaxed">{analysis.context}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Footer */}
      {!analysis && (
        <Card className="mt-8 bg-slate-900 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-sky-400" />
              Why check for bias?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm leading-relaxed">
              Egyptian culture is often subjected to "Orientalism"—a way of seeing the region as exotic, backward, or 
              static. By identifying these biases, we can engage with Egypt as a diverse, modern nation with 
              rich contemporary identities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};