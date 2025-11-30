'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/context/TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { createPortal } from 'react-dom';

export function TutorialOverlay() {
    const { isActive, currentStepIndex, steps, nextStep, previousStep, skipTutorial } = useTutorial();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isActive && steps[currentStepIndex]) {
            const updateRect = () => {
                const element = document.getElementById(steps[currentStepIndex].targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Add some padding
                    const padding = 8;
                    setTargetRect({
                        ...rect,
                        left: rect.left - padding,
                        top: rect.top - padding,
                        width: rect.width + padding * 2,
                        height: rect.height + padding * 2,
                        right: rect.right + padding,
                        bottom: rect.bottom + padding,
                        x: rect.x - padding,
                        y: rect.y - padding,
                        toJSON: () => { },
                    });
                } else {
                    // If element not found, maybe it's not rendered yet or we should skip?
                    // For now, let's just center if not found or handle gracefully
                    setTargetRect(null);
                }
            };

            updateRect();
            window.addEventListener('resize', updateRect);
            window.addEventListener('scroll', updateRect, true);

            return () => {
                window.removeEventListener('resize', updateRect);
                window.removeEventListener('scroll', updateRect, true);
            };
        }
    }, [isActive, currentStepIndex, steps]);

    if (!mounted || !isActive || !steps[currentStepIndex]) return null;

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Calculate popover position
    const getPopoverStyle = () => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const position = currentStep.position || 'bottom';
        const gap = 12;

        switch (position) {
            case 'top':
                return {
                    top: targetRect.top - gap,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translate(-50%, -100%)',
                };
            case 'bottom':
                return {
                    top: targetRect.bottom + gap,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translate(-50%, 0)',
                };
            case 'left':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left - gap,
                    transform: 'translate(-100%, -50%)',
                };
            case 'right':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + gap,
                    transform: 'translate(0, -50%)',
                };
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop with cutout */}
            <div className="absolute inset-0 bg-black/60 transition-colors duration-500">
                {targetRect && (
                    <div
                        style={{
                            position: 'absolute',
                            left: targetRect.left,
                            top: targetRect.top,
                            width: targetRect.width,
                            height: targetRect.height,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                            borderRadius: '8px',
                        }}
                        className="transition-all duration-300 ease-in-out"
                    />
                )}
            </div>

            {/* Popover */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={currentStepIndex}
                style={{
                    position: 'absolute',
                    ...getPopoverStyle(),
                }}
                className="pointer-events-auto w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {currentStep.title}
                        </h3>
                        <button
                            onClick={skipTutorial}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                        {currentStep.description}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${idx === currentStepIndex
                                            ? 'bg-indigo-600 dark:bg-indigo-400'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {currentStepIndex > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={previousStep}
                                    className="text-slate-600"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={nextStep}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
