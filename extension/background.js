chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "get_tab_id") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          sendResponse({ tabId: tabs[0].id });
        } else {
          sendResponse({ tabId: null });
        }
      });
      return true; // Keep the message channel open
    }
  });
  