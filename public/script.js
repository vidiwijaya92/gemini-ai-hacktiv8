const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// 1. Buat array kosong untuk menampung riwayat percakapan
let conversationHistory = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 2. Tampilkan pesan user di UI
  appendMessage("user", userMessage);
  input.value = "";

  // 3. Simpan pesan user ke dalam history (role harus 'user')
  conversationHistory.push({ role: "user", text: userMessage });

  // Tampilkan placeholder loading
  const botMsgElement = appendMessage("bot", "Gemini sedang berpikir...");

  try {
    // 4. Kirim SELURUH history ke server, bukan cuma pesan terakhir
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    const data = await response.json();

    if (response.ok) {
      // 5. Update UI dengan jawaban asli AI
      botMsgElement.textContent = data.result;

      // 6. Simpan jawaban bot ke history agar diingat di chat berikutnya
      // Role untuk AI di Gemini SDK adalah 'model'
      conversationHistory.push({ role: "model", text: data.result });
    } else {
      botMsgElement.textContent = "Error: " + data.error;
    }
  } catch (error) {
    botMsgElement.textContent = "Gagal terhubung ke server.";
    console.error(error);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Mengembalikan element agar bisa diupdate teksnya
}
