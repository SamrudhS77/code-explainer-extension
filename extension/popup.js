document.addEventListener("DOMContentLoaded", () => {
    // Restore saved model
    chrome.storage.sync.get(["model"], (data) => {
      if (data.model) {
        document.getElementById("modelSelect").value = data.model;
      }
    });
  
    document.getElementById("saveButton").addEventListener("click", () => {
      const model = document.getElementById("modelSelect").value;
      chrome.storage.sync.set({ model }, () => {
        const saveMsg = document.getElementById("saveMsg");
        saveMsg.style.display = "block";
  
        // Fade out after 2 seconds
        setTimeout(() => {
          saveMsg.style.display = "none";
        }, 2000);
      });
    });
  });
  