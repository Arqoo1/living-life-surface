export interface UIState {
  backgroundColor: string;
  textColor: string;
}

export const initialUIState: UIState = {
  backgroundColor: "#ffffff",
  textColor: "#1b1b1b",
};

export const parseAndExecuteRules = (rules: { content: string }[]): UIState => {
  const now = new Date();
  const currentHour = now.getHours();
  let resultState = { ...initialUIState };

  rules.forEach((rule) => {
    const text = rule.content.toLowerCase();

    // Pattern for: if hour > 20
    const timeMatch = text.match(/hour\s*>\s*(\d+)/);
    // Pattern for: set background = '#06040bff'
    const bgMatch = text.match(/background\s*=\s*['"]?([^'"{}\s]+)['"]?/);

    if (timeMatch && bgMatch) {
      const threshold = parseInt(timeMatch[1]);
      if (currentHour > threshold) {
        resultState.backgroundColor = bgMatch[1];
        // Automatically set text to white if background is very dark
        resultState.textColor = "#ffffff";
      }
    }
  });

  return resultState;
};