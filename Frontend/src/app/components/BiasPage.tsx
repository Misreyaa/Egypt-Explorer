import React, { useState } from 'react';
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
        setInputText("Thinking about the mysterious pyramids and how all Egyptians still live like the ancient times... it seems so exotic.");
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

      if (!res.ok) {
        console.error("Analyze failed:", res.status, await res.text());
        return;
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analyze request error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setInputText('');
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bias Detector</h1>
            <p className="text-muted-foreground text-sm">Review cultural framing and objectivity</p>
          </div>
        </div>
        {(analysis || inputText) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* 1. METRIC EXPLANATION LEGEND */}
      <Card className="mb-8 border-none bg-slate-50/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Analysis Scale</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.map((m) => (
              <div key={m.level} className="space-y-1.5 p-2 rounded-lg bg-white/50 border border-white">
                <div className={`h-1 w-full rounded-full ${m.color}`} />
                <p className={`text-[11px] font-bold ${m.text}`}>{m.label}</p>
                <p className="text-[10px] text-slate-400">Lvl {m.level}: {m.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card className="mb-8 border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Content Input</CardTitle>
          <CardDescription>Enter text or upload an image to identify potential biases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Type something here to test..."
                className="min-h-32 resize-none focus-visible:ring-slate-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button 
                onClick={() => analyzeText(inputText)} 
                disabled={!inputText.trim() || isAnalyzing} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-[0.98]"
              >
                {isAnalyzing ? 'Processing AI Models...' : (
                  <>
                    <Zap className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Analyze for Bias
                  </>
                )}
              </Button>
            </div>
            
            <div className="md:w-64 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[176px] hover:border-slate-300 transition-colors relative bg-slate-50/30">
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Image Extracted</p>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center group">
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Upload Content</span>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* RESTORED PRO TIP BOX */}
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

      {/* 2. DYNAMIC OUTPUT SECTION */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <Card className={`overflow-hidden border-none shadow-xl ring-1 ring-black/5`}>
            <div className={`h-2.5 ${getMetricData(analysis.biasLevel).color} transition-colors duration-500`} />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="secondary" className={`${getMetricData(analysis.biasLevel).text} bg-white shadow-sm border-none px-3 py-1`}>
                    Level {analysis.biasLevel}: {analysis.biasLabel}
                  </Badge>
                  <CardTitle className="text-2xl font-black pt-2">Analysis Results</CardTitle>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center min-w-[100px]">
                  <span className={`text-3xl font-black block ${getMetricData(analysis.biasLevel).text}`}>
                    {analysis.biasPercentage}%
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Bias Score</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1.5 px-1">
                  <span>Objective</span>
                  <span>Highly Biased</span>
                </div>
                <Progress value={analysis.biasPercentage} className="h-3 bg-slate-100" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Fingerprint className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Specific Indicators</h4>
                {analysis.biases && analysis.biases.length > 0 ? (
                  <div className="grid gap-3">
                    {analysis.biases.map((bias, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                        <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${getMetricData(analysis.biasLevel).color} bg-opacity-10`}>
                          <AlertCircle className={`h-4 w-4 ${getMetricData(analysis.biasLevel).text}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{bias.type}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{bias.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <CheckCircle className="h-5 w-5" />
                    <p className="text-xs font-bold uppercase">No Bias Detected</p>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-tight mb-1">Perspective Strategy</h4>
                  <p className="text-sm text-indigo-800/80 leading-relaxed italic">{analysis.context}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};