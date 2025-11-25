import { Check } from 'lucide-react';
import { DevolucaoStatus } from '@/types/devolucao';

interface TimelineStep {
  status: DevolucaoStatus;
  label: string;
  date?: string | null;
  user?: string | null;
}

interface TimelineStepperProps {
  currentStatus: DevolucaoStatus;
  steps: TimelineStep[];
}

const STATUS_ORDER = [
  DevolucaoStatus.RNC_ACEITA,
  DevolucaoStatus.DEVOLUCAO_SOLICITADA,
  DevolucaoStatus.NFE_EMITIDA,
  DevolucaoStatus.DEVOLUCAO_COLETADA,
  DevolucaoStatus.DEVOLUCAO_RECEBIDA,
  DevolucaoStatus.FINALIZADO,
];

export default function TimelineStepper({
  currentStatus,
  steps,
}: TimelineStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-start justify-between relative">
        {steps.map((step, index) => {
          const stepIndex = STATUS_ORDER.indexOf(step.status);
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;

          return (
            <div key={step.status} className="flex-1 relative">
              {/* Horizontal connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 right-0 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ width: 'calc(100% - 1.25rem)' }}
                />
              )}

              {/* Step content */}
              <div className="relative flex flex-col items-center z-10">
                {/* Step circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-blue-500 text-white shadow-md ring-4 ring-blue-200'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step label and details */}
                <div className="text-center max-w-[120px]">
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      isCompleted || isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Show details for completed steps */}
                  {isCompleted && step.date && (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-gray-600">
                        {new Date(step.date).toLocaleDateString('pt-BR')}
                      </p>
                      {step.user && (
                        <p className="text-xs text-gray-500 truncate">
                          {step.user}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Current step indicator */}
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      Etapa Atual
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
