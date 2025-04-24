const observedElements = new WeakSet();

function formatExplanation(text) {
    const html = text
      .replace(/```([\s\S]*?)```/g, '<pre style="background:#1f2937;padding:12px;border-radius:6px;overflow-x:auto;margin:12px 0;font-family:monospace;font-size:14px;color:#f3f4f6;">$1</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<h4 style="margin:16px 0 8px;font-size:16px;font-weight:600;color:#e2e8f0;">$1</h4>')
      .replace(/`([^`]+)`/g, '<code style="background:#374151;padding:3px 6px;border-radius:6px;font-family:monospace;font-size:90%;color:#d1d5db;">$1</code>')
      .replace(/^\s*([0-9]+)\.\s(.+)$/gm, '<div style="margin-top:8px;"><strong style="color:#facc15;">$1.</strong> <span style="color:#e5e7eb;">$2</span></div>')
      .replace(/^\*\s(.+)$/gm, '<div style="margin-left:16px; padding-left:10px; border-left:2px solid #4b5563; color:#d1d5db;">$1</div>')
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/\n/g, '<br>');
  
    return `
      <div style="
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 12px;
        padding: 20px;
        margin-top: 16px;
        font-family: 'Segoe UI', Roboto, sans-serif;
        font-size: 15px;
        color: #d1d5db;
        line-height: 1.7;
        box-shadow: 0 0 0 1px #1f2937;
      ">
        ${html}
      </div>
    `;
  }


document.querySelectorAll("pre code").forEach((codeBlock) => {
  const pre = codeBlock.closest("pre");
  if (!pre || observedElements.has(pre)) return;

  observedElements.add(pre);

  const container = document.createElement("div");
  container.className = "code-helper-container";
  container.style.marginTop = "10px";

  const button = document.createElement("button");
  button.innerText = "Explain Code";
  button.className = "code-helper-btn";
  button.style.cssText = `
  padding: 8px 16px;
  background-color: #facc15; /* yellow-400 */
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
`;

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#eab308"; 
    button.style.transform = "scale(1.03)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#facc15";
    button.style.transform = "scale(1)";
  });

  container.appendChild(button);

  pre.insertAdjacentElement("afterend", container);

  button.addEventListener("click", async () => {
    console.log("Explain Code button clicked");

    const code = codeBlock.textContent;
    console.log("Code captured:", code);

    button.disabled = true;
    button.innerText = "Explaining...";

    const settings = await chrome.storage.sync.get(["model"]);
    const model = settings.model || "mixtral-8x7b-32768";  
    console.log("⚙️ Model from storage:", model);

    chrome.runtime.sendMessage({ type: "get_tab_id" }, async (res) => {
      if (!res || !res.tabId) {
        console.error("Could not retrieve tab ID.");
        button.disabled = false;
        button.innerText = "Explain Code";
        return;
      }

      const payload = {
        code,
        model,
        tab_id: res.tabId.toString()
      };

      console.log("Sending request with body:", {
        code,
        model,
        tab_id: res.tabId?.toString()
      });

      try {
        const apiResponse = await fetch("http://localhost:8000/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await apiResponse.json();
        console.log("API response:", data);

        const old = container.querySelector(".code-helper-explanation");
        if (old) old.remove();

        // Create wrapper
        const wrapper = document.createElement("div");
        wrapper.style.marginTop = "10px";

        // Toggle button
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Hide Explanation ▲";
        toggleButton.style.cssText = `
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 13px;
        margin-bottom: 4px;
        padding-left: 0;
        `;

        toggleButton.addEventListener("click", () => {
        if (explainDiv.style.display === "none") {
            explainDiv.style.display = "block";
            toggleButton.textContent = "Hide Explanation ▲";
        } else {
            explainDiv.style.display = "none";
            toggleButton.textContent = "Show Explanation ▼";
        }
        });

        // Explanation box
        const explainDiv = document.createElement("div");
        explainDiv.className = "code-helper-explanation";
        explainDiv.innerHTML = formatExplanation(data.explanation);
        explainDiv.style.transition = "all 0.3s ease";

        wrapper.appendChild(toggleButton);
        wrapper.appendChild(explainDiv);
        container.appendChild(wrapper);

      } catch (err) {
        console.error("Error during fetch:", err);
        alert("Error fetching explanation. Check your server.");
      } finally {
        button.disabled = false;
        button.innerText = "Explain Code";
      }
    });
  });
});
