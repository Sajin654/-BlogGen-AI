async function generateBlog() {
  const topic = document.getElementById("topic").value.trim();
  const style = document.getElementById("style").value;
  const tone = document.getElementById("tone").value;
  const audience = document.getElementById("audience").value;
  const wordCount = document.getElementById("word_count").value;
  const instructions = document.getElementById("instructions").value.trim();

  const articlePaper = document.getElementById("articlePaper");
  const loading = document.getElementById("loading");
  const generateBtn = document.getElementById("generateBtn");

  if (!topic) {
    alert("Please enter a blog topic.");
    return;
  }

  loading.style.display = "flex";

  generateBtn.disabled = true;
  generateBtn.style.opacity = "0.6";
  generateBtn.style.cursor = "not-allowed";

  articlePaper.innerHTML = "";

  try {
    const response = await fetch("/generate", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        topic: topic,
        style: style,
        tone: tone,
        audience: audience,
        word_count: wordCount,
        instructions: instructions,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate article.");
    }

    articlePaper.innerHTML = formatArticle(data.content);
  } catch (error) {
    articlePaper.innerHTML = `
            <div class="empty-state">
                <div class="empty-symbol">!</div>
                <h3>Something went wrong</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
  } finally {
    loading.style.display = "none";

    generateBtn.disabled = false;
    generateBtn.style.opacity = "1";
    generateBtn.style.cursor = "pointer";
  }
}

function formatArticle(text) {
  let html = escapeHtml(text);

  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");

  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");

  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/\n\n+/g, "</p><p>");

  html = "<p>" + html + "</p>";

  html = html.replace(/<p><h([1-3])>/g, "<h$1>");

  html = html.replace(/<\/h([1-3])><\/p>/g, "</h$1>");

  return html;
}

function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

async function copyArticle() {
  const articlePaper = document.getElementById("articlePaper");

  const text = articlePaper.innerText.trim();

  if (!text || text.includes("Your article will appear here")) {
    alert("There is no generated article to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    alert("Article copied successfully.");
  } catch (error) {
    alert("Unable to copy the article.");
  }
}

function resetForm() {
  document.getElementById("topic").value = "";

  document.getElementById("style").value = "Professional";

  document.getElementById("tone").value = "Informative";

  document.getElementById("audience").value = "General";

  document.getElementById("word_count").value = "800";

  document.getElementById("instructions").value = "";

  document.getElementById("articlePaper").innerHTML = `
        <div class="empty-state">

            <div class="empty-symbol">
                +
            </div>

            <h3>Your article will appear here</h3>

            <p>
                Enter a topic and customize your content preferences,
                then click Generate Article to get started.
            </p>

        </div>
    `;
}
