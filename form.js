(() => {
  // ===== CONFIGURATION (unchanged from the original form) =====
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwqIpebrmE1FSsr8AZ161y1XHt1fzK5IZDlRNZPVOFGrN6e9jU72AaBXff6jLVkq585/exec";
  const DISCORD_USERNAME = "santiprobugYT";

  const root = document.getElementById("commission-app");
  if (!root) { console.error("Commission app not found."); return; }

  const form = root.querySelector("#commission-form");
  const payment = root.querySelector("#payment");
  const robuxFields = root.querySelector("#robux-fields");
  const paypalFields = root.querySelector("#paypal-fields");
  const robuxBudget = root.querySelector("#robux-budget");
  const robuxNegotiate = root.querySelector("#robux-negotiate");
  const paypalBudget = root.querySelector("#paypal-budget");
  const deadline = root.querySelector("#deadline");
  const discord = root.querySelector("#discord");
  const project = root.querySelector("#project");
  const extraBudget = root.querySelector("#extra-budget");
  const preview = root.querySelector("#message-preview");
  const submitButton = root.querySelector("#submit-button");
  const status = root.querySelector("#form-status");
  const SEND_LABEL = "Send commission request";
  let alreadySent = false; // true after a successful send, until "Clear form"

  root.querySelector("#discord-display").textContent = DISCORD_USERNAME;

  // ===== FORM DATA =====
  function selectedServices() {
    return Array.from(root.querySelectorAll('input[name="services"]:checked')).map(i => i.value);
  }
  function getBudget() {
    if (payment.value === "Robux") {
      return robuxBudget.value ? `${robuxBudget.value} Robux` : "Not specified";
    }
    return paypalBudget.value ? `$${Number(paypalBudget.value).toFixed(2)} USD` : "Not specified";
  }
  function getNegotiation() {
    if (payment.value === "Robux" && robuxNegotiate.checked) return "Open to negotiation";
    return "No additional negotiation preference";
  }

  // ===== MESSAGE PREVIEW =====
  function getMessage() {
    return [
      `Hi ${DISCORD_USERNAME}, I'd like to discuss a Roblox commission.`,
      "",
      `Services: ${selectedServices().join(", ") || "Not selected"}`,
      `Payment: ${payment.value}`,
      `Budget: ${getBudget()}`,
      `Negotiation: ${getNegotiation()}`,
      `Additional budget notes: ${extraBudget.value.trim() || "None"}`,
      `Deadline: ${deadline.value}`,
      `Discord: ${discord.value.trim() || "Not provided"}`,
      "",
      "Project description:",
      project.value.trim() || "Not provided"
    ].join("\n");
  }
  function updatePreview() { preview.textContent = getMessage(); }

  // ===== PAYMENT METHOD =====
  function updatePaymentFields() {
    const isRobux = payment.value === "Robux";
    robuxFields.classList.toggle("hidden", !isRobux);
    paypalFields.classList.toggle("hidden", isRobux);
    robuxBudget.required = isRobux && !robuxNegotiate.checked;
    paypalBudget.required = !isRobux;
    updatePreview();
  }

  // ===== STATUS MESSAGES =====
  function showStatus(message, type) {
    status.textContent = message;
    status.className = "status" + (type ? " " + type : "");
  }

  // ===== COPY SYSTEM =====
  async function copyText(text) {
    // Method 1: Clipboard API
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) { console.warn("Clipboard API unavailable:", error); }

    // Method 2: legacy fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      root.appendChild(ta);
      ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length);
      const copied = document.execCommand("copy");
      ta.remove();
      if (copied) return true;
    } catch (error) { console.warn("Legacy copy failed:", error); }

    // Method 3: manual copy box
    let fallback = root.querySelector("#manual-copy");
    if (!fallback) {
      fallback = document.createElement("div");
      fallback.id = "manual-copy";
      fallback.className = "contact-box";
      const heading = document.createElement("strong");
      heading.textContent = "Manual copy";
      const description = document.createElement("p");
      description.className = "muted small";
      description.textContent = "Automatic copying is unavailable. Select the text below and press Ctrl + C. On mobile, tap and hold to copy.";
      const field = document.createElement("textarea");
      field.id = "manual-copy-text";
      field.readOnly = true;
      field.rows = 5;
      field.style.marginTop = "10px";
      fallback.append(heading, description, field);
      root.appendChild(fallback);
    }
    fallback.classList.remove("hidden");
    const field = fallback.querySelector("#manual-copy-text");
    field.value = text;
    field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
    fallback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return false;
  }

  root.querySelector("#copy-button").addEventListener("click", async () => {
    const copied = await copyText(getMessage());
    if (copied) showStatus("Message copied! You can now send it on Discord.", "success");
    else showStatus("Please copy the selected text manually.", "error");
  });

  root.querySelector("#copy-discord").addEventListener("click", async () => {
    const output = root.querySelector("#discord-status");
    const copied = await copyText(DISCORD_USERNAME);
    if (copied) {
      output.textContent = "Username copied!";
      output.className = "status small success";
    } else {
      output.textContent = "Please copy the selected text manually.";
      output.className = "status small error";
    }
  });

  // NEW: manual "Clear form" (the form is no longer cleared automatically)
  root.querySelector("#clear-button").addEventListener("click", () => {
    form.reset();
    alreadySent = false;
    submitButton.textContent = SEND_LABEL;
    updatePaymentFields();
    showStatus("", "");
  });

  // ===== EVENT LISTENERS =====
  payment.addEventListener("change", updatePaymentFields);
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  robuxNegotiate.addEventListener("change", () => {
    robuxBudget.required = payment.value === "Robux" && !robuxNegotiate.checked;
    updatePreview();
  });

  // ===== COMMISSION SUBMISSION =====
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;
    if (root.querySelector("#website").value) return; // honeypot

    if (!selectedServices().length) {
      showStatus("Please select at least one service.", "error");
      return;
    }
    if (!SCRIPT_URL.startsWith("https://script.google.com/")) {
      showStatus("The form owner needs to configure the Apps Script URL.", "error");
      return;
    }

    // Data sent to Google Apps Script (same structure as the original).
    const data = {
      services: selectedServices(),
      payment: payment.value,
      budget: getBudget(),
      negotiation: `${getNegotiation()}; Additional notes: ${extraBudget.value.trim() || "None"}`,
      deadline: deadline.value,
      discord: discord.value.trim(),
      project: project.value.trim()
    };
    const body = new URLSearchParams({ payload: JSON.stringify(data) });

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    showStatus("Sending your request...", "");

    try {
      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: body });
      // The form is kept (not cleared) so nothing is lost if saving failed.
      alreadySent = true;
      showStatus(
        "Your request was submitted for processing. The browser cannot verify whether it was saved. Please contact me on Discord if you don't receive a reply. Your answers were kept; use \"Clear form\" when you're done.",
        "success"
      );
    } catch (error) {
      console.error("Submission error:", error);
      showStatus("The request could not be sent. Please try again or contact me on Discord.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = alreadySent ? "Send again" : SEND_LABEL;
    }
  });

  // ===== INITIALIZATION =====
  updatePaymentFields();
  updatePreview();
})();
