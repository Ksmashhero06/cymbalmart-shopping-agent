import React, { useState } from 'react';
import { Clock, CheckCircle, Circle, Sparkles, Calendar, Lightbulb } from 'lucide-react';
import { PartyPlan } from '../types';

interface PartyTimelineProps {
  plan: PartyPlan;
}

export const PartyTimeline: React.FC<PartyTimelineProps> = ({ plan }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskKey: string) => {
    const next = new Set(completedTasks);
    if (next.has(taskKey)) {
      next.delete(taskKey);
    } else {
      next.add(taskKey);
    }
    setCompletedTasks(next);
  };

  const milestones = plan.timelineMilestones || [];
  const tips = plan.expertTips || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Shopping & Host Preparation Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            A stress-free countdown checklist guiding when to purchase items, prep cocktails in advance, and chill beverages for maximum freshness.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-xl border border-amber-200 shrink-0">
          <Calendar className="w-4 h-4 text-amber-600" />
          {completedTasks.size} Tasks Checked Off
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestones timeline (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {milestones.map((milestone, mIdx) => (
            <div
              key={mIdx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {mIdx + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {milestone.timing}
                </h3>
              </div>

              <div className="space-y-2">
                {milestone.tasks.map((task, tIdx) => {
                  const taskKey = `${mIdx}-${tIdx}`;
                  const isDone = completedTasks.has(taskKey);

                  return (
                    <div
                      key={tIdx}
                      onClick={() => toggleTask(taskKey)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white hover:bg-amber-50/40 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <span className={`font-medium leading-relaxed ${isDone ? 'line-through' : ''}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pro-Tips & Portions (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Host Pro-Tips Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>AI Host Pro-Tips</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              {tips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portion Guidelines Card */}
          {plan.portionGuidelines && plan.portionGuidelines.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Calibrated Portion Math
              </h4>
              <div className="space-y-2.5 text-xs">
                {plan.portionGuidelines.map((guideline, gIdx) => (
                  <div key={gIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{guideline.label}</span>
                      <span className="text-emerald-700">{guideline.recommended}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {guideline.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
