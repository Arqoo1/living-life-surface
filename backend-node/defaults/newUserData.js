export const defaultMoments = [
  {
    type: "happy",
    content: "Welcome to your Life Dashboard!",
    track: ["Introduction"],
    customStyle: { background: "#e190e3", text: "#1b1b1b" },
  },
  {
    type: "reflective",
    content: "Try adding your first moment",
    track: ["Reflection"],
    customStyle: { background: "#b890e3", text: "#ffffff" },
  },
];

export const defaultTracks = [
  { name: "Mood", color: "#e190e3" },
  { name: "Work", color: "#b890e3" },
  { name: "Health", color: "#2E186A" },
];

export const defaultRules = [
  { content: "set ui.bg = '#070202ff'" },
  { content: "set ui.text = '#ffffffff'" },
  { content: "if hour > 16 set background = '#06040bff'" }, // Keep old format for compatibility
];
