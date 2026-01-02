
function evaluate(op: string, threshold: number, current: number): boolean {
  if (op === ">") return current > threshold;
  if (op === "<") return current < threshold;
  if (op === ">=") return current >= threshold;
  if (op === "<=") return current <= threshold;
  if (op === "==") return current === threshold;
  return false;
}

self.onmessage = (e: MessageEvent) => {
  const { rules, context } = e.data;

  const hour = context?.hour ?? new Date().getHours();
  const minute = context?.minute ?? new Date().getMinutes();
  const lastMoment = context?.lastMoment || null;

  const resultVariables: Record<string, string> = {};

  if (!rules || !Array.isArray(rules)) return;

  rules.forEach((rule: { content: string }) => {
    const content = rule.content;

    // 1. TIME BLOCK
    const timeRegex =
      /when\s+time\s*(>=|<=|==|>|<)\s*(\d{2}:\d{2})\s*\{[\s\S]*?set\s+ui\.([\w-]+)\s*=\s*([#\w\d]+)[\s\S]*?\}/gi;
    let tm;
    while ((tm = timeRegex.exec(content)) !== null) {
      const [_, op, timeStr, prop, val] = tm;
      // Map properties to CSS variables
      const cssVar =
        prop === "bg"
          ? "--bg-main"
          : prop === "momentBg"
          ? "--moment-bg"
          : prop === "text"
          ? "--text-main"
          : `--${prop}`;

      const [rHour, rMin] = timeStr.split(":").map(Number);
      if (evaluate(op, rHour * 60 + rMin, hour * 60 + minute)) {
        resultVariables[cssVar] = val;
      }
    }

    // 2. MOOD/STATE BLOCK
    const stateRegex =
      /when\s+(?:state|lastMoment\.type)\s*==\s*['"]?([\w-]+)['"]?\s*\{[\s\S]*?set\s+ui\.momentBg\s*=\s*([#\w\d]+)[\s\S]*?\}/gi;
    let sm;
    while ((sm = stateRegex.exec(content)) !== null) {
      const [_, stateValue, val] = sm;
      resultVariables[`--moment-color-${stateValue}`] = val;
    }

    // 3. FALLBACK
    const oldRegex =
      /if\s+hour\s*(>|<|>=|<=)\s*(\d+)\s+set\s+background\s*=\s*['"]?([#\w\d]+)['"]?/gi;
    let om;
    while ((om = oldRegex.exec(content)) !== null) {
      const [_, op, hr, val] = om;
      if (evaluate(op, parseInt(hr), hour)) {
        resultVariables[`--bg-main`] = val;
      }
    }
  });

  self.postMessage(resultVariables);
};

export {};
