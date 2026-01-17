// Default templates for landing page steps
// These templates provide initial empty state with template loading options

export const getDefaultStep1Content = () => {
  // Return null to indicate empty state - will be populated via template button
  return null;
};

export const getDefaultStep2Content = () => {
  // Return null to indicate empty state - will be populated via template button
  return null;
};

export const getDefaultStepContent = (step: '1' | '2' | '3') => {
  switch (step) {
    case '1':
      return getDefaultStep1Content();
    case '2':
      return getDefaultStep2Content();
    case '3':
      return null;
    default:
      return null;
  }
};
