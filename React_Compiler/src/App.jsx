import React, { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import "./styles.css";

const RunButton = () => {
  const { sandpack } = useSandpack();

  return (
    <button className="run-btn" onClick={() => sandpack.runSandpack()}>
      ▶ Run Code
    </button>
  );
};

export default function App() {
  const [files, setFiles] = useState({
    "/App.js": {
      code: `export default function App() {
  return <h1>Hello CipherStudio!</h1>;
}`,
    },
    "/index.js": {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);`,
    },
  });

  const [activeFile, setActiveFile] = useState("/App.js");

  useEffect(() => {
    const saved = localStorage.getItem("cipherLocalProject");
    if (saved) setFiles(JSON.parse(saved));
  }, []);

  const saveLocal = () => {
    localStorage.setItem("cipherLocalProject", JSON.stringify(files));
    alert("✅ Saved locally!");
  };

  const addFile = () => {
    const name = prompt("Enter file name (Example: Test.js)");
    if (!name) return;
    setFiles({ ...files, [`/${name}`]: { code: `// ${name}` } });
    setActiveFile(`/${name}`);
  };

  const deleteFile = (name) => {
    if (name === "/index.js") return alert("⚠ Cannot delete main file!");
    const updated = { ...files };
    delete updated[name];
    setFiles(updated);
    setActiveFile("/App.js");
  };

  const saveToDB = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json();
      alert(`✅ Saved to DB! Project ID: ${data.projectId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save to DB");
    }
  };

  const loadFromDB = async () => {
    const id = prompt("Enter Project ID:");
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`);
      const data = await res.json();

      if (data.files) {
        setFiles(data.files);
        alert("✅ Project Loaded!");
      } else {
        alert("❌ Invalid ID");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error loading project");
    }
  };

  return (
    <div className="container">
      {/* ✅ Sidebar */}
      <aside className="sidebar">
        <h3>📁 Files</h3>

        {Object.keys(files).map((file) => (
          <div
            key={file}
            className={`file-item ${file === activeFile ? "active" : ""}`}
            onClick={() => setActiveFile(file)}
          >
            {file}
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file);
              }}
            >
              ❌
            </button>
          </div>
        ))}

        <button className="btn" onClick={addFile}>
          ➕ Add File
        </button>
        <button className="btn" onClick={saveLocal}>
          💾 Save Local
        </button>
        <button className="btn" onClick={saveToDB}>
          🌐 Save DB
        </button>
        <button className="btn" onClick={loadFromDB}>
          🔁 Load DB
        </button>
      </aside>

      <SandpackProvider
        template="react"
        files={files}
        activeFile={activeFile}
        theme="dark"
        options={{ recompileMode: "manual" }}
      >
        <div className="editor-area">
          <RunButton />
          <SandpackLayout>
            <SandpackCodeEditor showTabs showLineNumbers wrapContent />
            <SandpackPreview />
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  );
}
