import { View, Text } from 'react-native';

interface StepProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepProps> = ({ totalSteps, currentStep }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className="relative h-12 justify-center px-4">
      {/* Full background line */}
      <View className="absolute left-4 right-4 top-1/2 h-[2px] bg-gray-300 z-0" />

      {/* Step Circles */}
      <View className="flex-row justify-between items-center">
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          const bgColor = isActive
            ? 'bg-blue-500'
            : isCompleted
            ? 'bg-green-500'
            : 'bg-gray-300';
          const textColor = isActive || isCompleted ? 'text-white' : 'text-gray-700';

          return (
            <View
              key={step}
              className={`w-10 h-10 ${bgColor} rounded-full items-center justify-center z-10`}
            >
              <Text className={`font-bold text-lg ${textColor}`}>{step}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StepIndicator;
