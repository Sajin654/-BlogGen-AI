from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()

        topic = data.get("topic", "").strip()
        style = data.get("style", "Professional")
        tone = data.get("tone", "Informative")
        audience = data.get("audience", "General")
        word_count = data.get("word_count", "800")
        instructions = data.get("instructions", "").strip()

        if not topic:
            return jsonify({
                "error": "Please enter a blog topic."
            }), 400

        prompt = f"""
You are a professional blog writer.

Write a high-quality, engaging and well-structured blog article based on the following requirements.

Topic: {topic}
Writing Style: {style}
Tone: {tone}
Target Audience: {audience}
Target Word Count: {word_count} words
Additional Instructions: {instructions if instructions else "None"}

Requirements:
- Create an attractive and relevant title.
- Use clear headings and subheadings.
- Keep the content informative and engaging.
- Maintain the requested writing style and tone.
- Make the content suitable for the target audience.
- Follow the requested approximate word count.
- Avoid unnecessary repetition.
- Use proper paragraphs and formatting.
- Return only the blog article.
"""

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1800
                }
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()

        return jsonify({
            "content": result.get("response", "")
        })

    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "Could not connect to Ollama. Make sure Ollama is running."
        }), 500

    except requests.exceptions.Timeout:
        return jsonify({
            "error": "The AI took too long to respond. Please try again."
        }), 500

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)