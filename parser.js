function parseSmartInput(input) {
    const text = input.trim();
  
    const taskWords = /\b(finish|do|complete|submit|prepare|send|buy|fix|build|review|study|call)\b/i;
    const ideaWords = /\b(idea|maybe|what if|concept)\b/i;
    const dueWords = /\b(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\s?(am|pm))\b/i;
  
    let type = "note";
  
    if (taskWords.test(text) || dueWords.test(text)) {
      type = "task";
    }
  
    if (ideaWords.test(text)) {
      type = "idea";
    }
  
    let priority = "Normal";
  
    if (/\b(urgent|high priority|important|asap)\b/i.test(text)) {
      priority = "High";
    } else if (/\b(low priority|not urgent)\b/i.test(text)) {
      priority = "Low";
    }
  
    let dueDate = null;
  
    if (/\btoday\b/i.test(text)) {
      dueDate = new Date().toISOString().split("T")[0];
    }
  
    if (/\btomorrow\b/i.test(text)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split("T")[0];
    }
  
    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/i);
    let dueTime = null;
  
    if (timeMatch) {
      let hour = Number(timeMatch[1]);
      const minute = timeMatch[2] || "00";
      const period = timeMatch[3].toLowerCase();
  
      if (period === "pm" && hour !== 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
  
      dueTime = `${String(hour).padStart(2, "0")}:${minute}`;
    }
  
    const title = text
      .replace(/\b(today|tomorrow|tonight)\b/gi, "")
      .replace(/\bat\s+\d{1,2}(:\d{2})?\s?(am|pm)\b/gi, "")
      .replace(/\b(urgent|high priority|low priority|important|asap|not urgent)\b/gi, "")
      .trim();
  
    const tags = [];
  
    if (/n1le/i.test(text)) tags.push("N1LE");
    if (/assignment|homework|study/i.test(text)) tags.push("Study");
    if (/server|github|render|notion|api/i.test(text)) tags.push("Development");
    if (/fitness|gym|workout|health/i.test(text)) tags.push("Health");
  
    const project = /n1le/i.test(text) ? "N1LE" : null;
  
    return {
      type,
      title: title || text,
      content: text,
      priority,
      dueDate,
      dueTime,
      project,
      tags,
    };
  }
  
  module.exports = { parseSmartInput };