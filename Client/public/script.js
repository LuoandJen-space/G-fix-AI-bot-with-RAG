async function sendMessage() {
    let input = document.getElementById("message");
    let message = input.value;

    if (!message) return;

    let response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    let data = await response.json();
    let chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += "<p><b>You:</b> " + message + "</p>";
    chatbox.innerHTML += "<p><b>Bot:</b> " + data.reply + "</p>";
    chatbox.scrollTop = chatbox.scrollHeight;

    input.value = "";
}