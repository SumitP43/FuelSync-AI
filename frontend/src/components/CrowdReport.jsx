'use client';

import { useState } from 'react';

export default function CrowdReport({ pump, onReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const [waitTime, setWaitTime] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onReport?.({ pumpId: pump.id, waitTime });
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm w-full"
      >
        📊 Report Waiting Time
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-slide-up">
            {submitted ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-white font-semibold text-lg">Thanks!</h3>
                <p className="text-zinc-400 text-sm">Your report helps other drivers.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Report Crowd</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors text-xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-zinc-400 text-sm mb-1">{pump.name}</p>
                <p className="text-zinc-600 text-xs mb-6">{pump.address}</p>

                {/* Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-300 text-sm font-medium">Current wait time</p>
                    <span className="text-fuel-green font-bold text-xl">{waitTime} min</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={waitTime}
                    onChange={(e) => setWaitTime(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:bg-fuel-green [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-fuel-green/30
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>0 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                <button onClick={handleSubmit} className="btn-primary w-full">
                  Submit Report
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
