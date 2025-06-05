let summary = "";

//may need to be async func
function generateSummary(text) {
  return text;
}
chrome.commands.onCommand.addListener((command) => {
  if (command === "summarize-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab.id) return;
      // Run a function inside the webpage that grabs the selected text and alerts it
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const selection = window.getSelection();
            if (!selection.rangeCount) console.log("bad");
            const range = selection.getRangeAt(0);
            console.log(range.toString());
            return range.toString();
          },
        },
        (results) => {
          const selectedText = results?.[0]?.result;
          if (!selectedText) {
            summary = "No text selected.";
          }else if (selectedText.length>1000){
            summary = "Text is too large"
          }else {
            summary = generateSummary(selectedText);
          }
          chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 400,
            height: 300,
            top: 300
          });
          //console.logs here will show up in the background.js console found in the chrome dev tools site
        }
      );
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getSummary") {
    sendResponse(summary);
    return true; // keeps the message channel open for async response (optional here)
  }
});
