import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    "",
});

let summary = "";

/*    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You summarize text into a simple 1 sentence overview, abstracting into Fortnite  terms and lingo. You do not need to explain how it connects back to the original text.",
        },
        {
          role: "user",
          content: `Explain this text in Fortnite terms:\n\n${text}`,
        },
      ],
      max_tokens: 60,
    });
 */

// Make this async and call OpenAI
async function generateSummary(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 50,
      messages: [
        {
          role: "system",
          content:
            "You provide a very simple, one-sentence summary of the user's text.",
        },
        {
          role: "user",
          content: text, // just the raw text, no extra instruction needed here
        },
      ],
    });
    const result = completion.choices[0]?.message?.content;
    return result || "No summary generated.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Error generating summary.";
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "summarize-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return null;
            return selection.getRangeAt(0).toString();
          },
        },
        async (results) => {
          const selectedText = results?.[0]?.result;
          if (!selectedText) {
            summary = "No text selected.";
          } else if (selectedText.length > 1000) {
            summary = "Text is too large.";
          } else {
            summary = await generateSummary(selectedText);
          }

          chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 400,
            height: 300,
            top: 300,
          });
        }
      );
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getSummary") {
    sendResponse(summary);
    return true;
  }
});
