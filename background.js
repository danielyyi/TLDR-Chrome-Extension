const extensions = "https://developer.chrome.com/docs/extensions";
const webstore = "https://developer.chrome.com/docs/webstore";

chrome.action.onClicked.addListener(async (tab) => {
  if (
    tab.url.startsWith(extensions) ||
    tab.url.startsWith(webstore) ||
    tab.url.startsWith("https://")
  ) {
    if (!tab.id) return;
    // Run a function inside the webpage that grabs the selected text and alerts it
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
          alert("Selected text: " + selectedText);
        } else {
          alert("No text is selected!");
        }
      },
    });
  }
});
