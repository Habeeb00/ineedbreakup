document.addEventListener("DOMContentLoaded", function () {
  const text = `Here's a pathetic person...

So, you said yes to that obsessed person on Valentine’s.

And you found he or she is not that interesting...

You want to break up but don't have the guts?

I got ya!

Here's a virtual GF/BF to train you to dodge every excuse and get a breakup!

Prepare yourself.

Peace :)`;

  let index = 0;
  const speed = 55;
  const textElement = document.getElementById("typing-text");
  const bottomText = document.getElementById("bottom-text");
  const to = document.getElementById("to");
  const cursor = document.getElementById("cursor");

  // Load typing sound
  const typingSound = new Audio("typing.mp3");
  typingSound.loop = true;

  function typeEffect() {
    if (textElement && index < text.length) {
      textElement.innerHTML += text.charAt(index);
      index++;
    }
  }

  // Start typing effect with sound
  typingSound.play();
  const typingInterval = setInterval(() => {
    if (index < text.length) {
      typeEffect();
    } else {
      clearInterval(typingInterval);
      typingSound.pause();
      typingSound.currentTime = 0;
      bottomText.style.display = "block";
      cursor.style.display = "inline-block";
      to.style.display = "block";
    }
  }, speed);
});

// ========== Gemini Chat Logic ==========

const GEMINI_API_KEY = "AIzaSyBQM6s96-vxf0Xq3-m4aAteCjNgg1G366E"; // Replace with your actual API key

function getCachedResponse(message) {
  const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
  return cache[message] || null;
}

function saveResponseToCache(message, response) {
  const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
  cache[message] = response;
  localStorage.setItem("chatCache", JSON.stringify(cache));
}

function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
}

let currentResponse = "";

async function getGeminiResponse(message) {
  const prompt2 = `old context is: ${currentResponse} Generate a simple humorous english breakup excuse from complex reaseon to silly reason, try continuing with older respnses${message}. Generate only one excuse and just the excuse`;

  try {
    const cachedResponse = getCachedResponse(message);
    if (cachedResponse) {
      console.log("Using cached response");
      return cachedResponse;
    }

    const response = await Promise.race([
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt2 }],
              },
            ],
          }),
        }
      ),
      timeout(10000),
    ]);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `Error: ${response.status} ${response.statusText} - ${errorMessage}`
      );
    }

    const data = await response.json();
    console.log(data);
    const reply =
      data.candidates?.[0]?.content.parts[0].text ||
      "No response from Gemini AI.";

    saveResponseToCache(message, reply);
    currentResponse = reply;

    return reply;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("Request timed out")) {
      return "The request timed out. Please try again.";
    } else if (error.message.includes("Rate limit exceeded")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    return "Oops! The AI is overwhelmed. Try again later.";
  }
}

function displayResponse(message, response) {
  const chatbox = document.getElementById("chatbox");
  chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  chatbox.innerHTML += `<p><strong>AI:</strong> ${response}</p>`;
  chatbox.scrollTop = chatbox.scrollHeight;
}

document.getElementById("sendButton").addEventListener("click", async function () {
  const userInput = document.getElementById("userInput").value;
  if (!userInput.trim()) return;

  const aiResponse = await getGeminiResponse(userInput);
  displayResponse(userInput, aiResponse);
  document.getElementById("userInput").value = "";
});
