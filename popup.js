chrome.runtime.sendMessage("getSummary", (response) => {
  document.getElementById("displayText").textContent = response || "No string received";
});