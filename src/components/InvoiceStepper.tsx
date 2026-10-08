import React from 'react';
import { Check } from 'lucide-react';

interface InvoiceStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Setup' },
  { id: 2, name: 'Items' },
  { id: 3, name: 'Summary' },
  { id: 4, name: 'Preview' },
];

export const InvoiceStepper: React.FC<InvoiceStepperProps> = ({ currentStep }) => {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <React.Fragment key={step.id}>
            <div className={`step ${isActive ? 'active' : ''}`}>
              <div className="step-number">
                {isCompleted ? <Check size={14} /> : `0${step.id}`}
              </div>
              <span>{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <span className="step-separator">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
