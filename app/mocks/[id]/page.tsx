"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface Question {
  id: string;
  text: string;
  options: string[];
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "If A is a square matrix of order 3 and |A| = 5, then what is the value of |adj(A)|?",
    options: ["5", "10", "25", "125"],
  },
  {
    id: "q2",
    text: "What is the principal value of sin⁻¹(sin(2π/3))?",
    options: ["2π/3", "π/3", "-π/3", "4π/3"],
  },
  {
    id: "q3",
    text: "The derivative of tan⁻¹[(cos x - sin x)/(cos x + sin x)] with respect to x is:",
    options: ["1", "-1", "1/2", "-1/2"],
  },
  {
    id: "q4",
    text: "How many sub-sets does a set containing 5 distinct elements have?",
    options: ["10", "25", "32", "64"],
  },
];

export default function MockTestRunnerPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = React.useState(5400); // 90 minutes in seconds

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = SAMPLE_QUESTIONS[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIdx });
  };

  const handleFinish = () => {
    router.push(`/dashboard/mocks/nda-maths-01/result`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between rounded-panel border border-steel-700 bg-navy-900 p-4">
        <div>
          <span className="font-mono text-xs text-gold-300 uppercase font-semibold">NDA-MTH-2027-01</span>
          <h1 className="text-lg font-bold text-white">NDA Mathematics Mock Test</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-lg font-bold text-gold-400 border border-gold-400/30 bg-gold-400/10 px-3 py-1 rounded-control">
            ⏱ {formatTime(timeLeft)}
          </div>
          <Button variant="danger" size="sm" onClick={handleFinish}>
            Submit Paper
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Question Box */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-steel-700/60 pb-3">
              <Badge variant="gold">Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}</Badge>
              <span className="text-xs text-steel-400">+2.5 Marks // -0.83 Negative</span>
            </div>

            <p className="text-base font-medium text-white leading-relaxed">{currentQ.text}</p>

            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex w-full items-center gap-4 rounded-control border p-4 text-left text-sm transition-all ${
                      isSelected
                        ? "border-gold-400 bg-gold-400/10 text-white font-medium"
                        : "border-steel-700 bg-navy-950 text-steel-300 hover:bg-navy-800"
                    }`}
                  >
                    <span className={`flex size-6 items-center justify-center rounded-full font-mono text-xs font-bold ${
                      isSelected ? "bg-gold-400 text-navy-950" : "bg-navy-800 text-steel-300"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between border-t border-steel-700/60 pt-4">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous Question
              </Button>
              {currentIndex < SAMPLE_QUESTIONS.length - 1 ? (
                <Button variant="primary" onClick={() => setCurrentIndex((prev) => prev + 1)}>
                  Next Question
                </Button>
              ) : (
                <Button variant="primary" onClick={handleFinish}>
                  Complete Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Palette Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-white text-sm">Question Palette</h3>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_QUESTIONS.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex size-10 items-center justify-center rounded-control font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? "border-2 border-gold-400 text-gold-300"
                        : isAnswered
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                        : "bg-navy-950 text-steel-500 border border-steel-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}