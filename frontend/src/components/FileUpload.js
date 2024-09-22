import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file to backend for OCR processing
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedText(res.data.text);

      // Send extracted text for summarization
      const summaryRes = await axios.post("http://localhost:5000/summarize", { text: res.data.text });
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

      <h2>Extracted Text:</h2>
      <p>{extractedText}</p>

      <h2>Summary:</h2>
      <p>{summary}</p>
    </div>
  );
}

export default FileUpload;
