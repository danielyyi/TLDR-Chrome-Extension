async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.getSelection().toString()
  });
  return result[0].result;
}

async function generateResponse(text, endpoint) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function handleButtonClick(endpoint) {
  const summaryElement = document.getElementById('summary');
  
  try {
    const selectedText = await getSelectedText();
    
    if (!selectedText) {
      summaryElement.textContent = 'Please select some text first!';
      summaryElement.className = 'error visible';
      return;
    }

    if (selectedText.length > 1000) {
      summaryElement.textContent = 'Selected text is too long. Please select less than 1000 characters.';
      summaryElement.className = 'error visible';
      return;
    }

    summaryElement.textContent = 'Loading...';
    summaryElement.className = 'loading visible';

    const summary = await generateResponse(selectedText, endpoint);
    summaryElement.textContent = summary;
    summaryElement.className = 'visible';
  } catch (error) {
    summaryElement.textContent = 'Error: Could not connect to the server. Please make sure the server is running.';
    summaryElement.className = 'error visible';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('summarizeBtn').addEventListener('click', () => handleButtonClick('/summarize'));
  document.getElementById('fortniteBtn').addEventListener('click', () => handleButtonClick('/fortnite'));
  document.getElementById('nbaBtn').addEventListener('click', () => handleButtonClick('/nba'));
});