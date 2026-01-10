import { create } from 'zustand';

interface ProductWizardState {
    productType: string | null;
    currentStep: number;
    completedSteps: number[];
    stepData: Record<number, any>;
    aiOutput: any | null;

    setProductType: (type: string) => void;
    setCurrentStep: (step: number) => void;
    completeStep: (step: number) => void;
    setStepData: (step: number, data: any) => void;
    setAIOutput: (output: any) => void;
    reset: () => void;
}

export const useProductWizardStore = create<ProductWizardState>((set) => ({
    productType: null,
    currentStep: 1,
    completedSteps: [],
    stepData: {},
    aiOutput: null,

    setProductType: (type) => set({ productType: type }),

    setCurrentStep: (step) => set({ currentStep: step }),

    completeStep: (step) => set((state) => ({
        completedSteps: [...new Set([...state.completedSteps, step])]
    })),

    setStepData: (step, data) => set((state) => ({
        stepData: { ...state.stepData, [step]: data }
    })),

    setAIOutput: (output) => set({ aiOutput: output }),

    reset: () => set({
        productType: null,
        currentStep: 1,
        completedSteps: [],
        stepData: {},
        aiOutput: null
    })
}));
