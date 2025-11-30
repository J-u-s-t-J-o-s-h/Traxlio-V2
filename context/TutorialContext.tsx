'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export interface TutorialStep {
    targetId: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialContextType {
    isActive: boolean;
    currentStepIndex: number;
    steps: TutorialStep[];
    startTutorial: (steps: TutorialStep[]) => void;
    endTutorial: () => void;
    nextStep: () => void;
    previousStep: () => void;
    skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState<TutorialStep[]>([]);

    const startTutorial = React.useCallback((newSteps: TutorialStep[]) => {
        setSteps(newSteps);
        setCurrentStepIndex(0);
        setIsActive(true);
    }, []);

    const endTutorial = React.useCallback(() => {
        setIsActive(false);
        setSteps([]);
        setCurrentStepIndex(0);
        if (typeof window !== 'undefined') {
            localStorage.setItem('has_seen_tutorial', 'true');
        }
    }, []);

    const skipTutorial = React.useCallback(() => {
        endTutorial();
    }, [endTutorial]);

    const nextStep = React.useCallback(() => {
        setCurrentStepIndex((prev) => {
            if (prev < steps.length - 1) {
                return prev + 1;
            }
            endTutorial();
            return prev;
        });
    }, [steps.length, endTutorial]);

    const previousStep = React.useCallback(() => {
        setCurrentStepIndex((prev) => {
            if (prev > 0) {
                return prev - 1;
            }
            return prev;
        });
    }, []);

    return (
        <TutorialContext.Provider
            value={{
                isActive,
                currentStepIndex,
                steps,
                startTutorial,
                endTutorial,
                nextStep,
                previousStep,
                skipTutorial,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
}
