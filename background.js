let summary = "";

// Make this async and call your proxy server instead of OpenAI directly
async function generateSummary(text) {
  try {
    const response = await fetch("http://localhost:3000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Proxy server error: ${response.status}`);
    }

    const data = await response.json();
    return data.summary || "No summary generated.";
  } catch (error) {
    console.error("Error calling proxy server:", error);
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
