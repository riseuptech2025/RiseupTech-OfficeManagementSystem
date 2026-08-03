// src/components/Common/RichTextEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  height = '300px',
  readOnly = false,
  theme = 'snow'
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = useRef(null);

  useEffect(() => {
    if (value !== undefined && value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  // Custom toolbar options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ color: [] }, { background: [] }],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // Custom formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'color', 'background',
    'clean',
  ];

  // Custom CSS for the editor
  const editorStyles = {
    height: height,
    backgroundColor: '#0A0A0F',
    color: '#FFFFFF',
    border: '1px solid #374151',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  // Override Quill styles
  useEffect(() => {
    // Add custom styles to Quill
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .ql-editor {
        min-height: 200px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #e5e7eb !important;
      }
      .ql-editor p {
        color: #e5e7eb !important;
      }
      .ql-editor h1, .ql-editor h2, .ql-editor h3, 
      .ql-editor h4, .ql-editor h5, .ql-editor h6 {
        color: #ffffff !important;
      }
      .ql-editor a {
        color: #00D4FF !important;
      }
      .ql-editor ul, .ql-editor ol {
        color: #e5e7eb !important;
      }
      .ql-editor blockquote {
        border-left: 4px solid #00D4FF;
        padding-left: 16px;
        color: #9ca3af !important;
        background: rgba(0, 212, 255, 0.05);
        margin: 12px 0;
      }
      .ql-editor code {
        background: #1a1a2e;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 13px;
        color: #00D4FF;
      }
      .ql-editor pre {
        background: #1a1a2e;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #374151;
        overflow-x: auto;
      }
      .ql-editor pre code {
        background: transparent;
        padding: 0;
        color: #e5e7eb;
      }
      .ql-editor img {
        max-width: 100%;
        border-radius: 8px;
        margin: 8px 0;
      }
      .ql-editor iframe {
        max-width: 100%;
        border-radius: 8px;
        margin: 8px 0;
      }
      
      /* Toolbar styling */
      .ql-toolbar.ql-snow {
        border: 1px solid #374151 !important;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        background: #0A0A0F;
        padding: 8px;
      }
      .ql-toolbar.ql-snow button {
        color: #d1d5db !important;
      }
      .ql-toolbar.ql-snow button:hover {
        color: #00D4FF !important;
      }
      .ql-toolbar.ql-snow .ql-picker-label {
        color: #d1d5db !important;
      }
      .ql-toolbar.ql-snow .ql-picker-options {
        background: #1a1a2e !important;
        border-color: #374151 !important;
        color: #d1d5db !important;
      }
      .ql-toolbar.ql-snow .ql-picker-item:hover {
        color: #00D4FF !important;
      }
      .ql-container.ql-snow {
        border: 1px solid #374151 !important;
        border-top: none !important;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        background: #0A0A0F;
      }
      .ql-snow .ql-stroke {
        stroke: #d1d5db !important;
      }
      .ql-snow .ql-fill {
        fill: #d1d5db !important;
      }
      .ql-snow .ql-picker {
        color: #d1d5db !important;
      }
      .ql-snow.ql-toolbar button:hover .ql-stroke {
        stroke: #00D4FF !important;
      }
      .ql-snow.ql-toolbar button.ql-active .ql-stroke {
        stroke: #00D4FF !important;
      }
      .ql-snow.ql-toolbar button:hover .ql-fill {
        fill: #00D4FF !important;
      }
      .ql-snow.ql-toolbar button.ql-active .ql-fill {
        fill: #00D4FF !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="rich-text-editor" style={editorStyles}>
      <ReactQuill
        ref={quillRef}
        theme={theme}
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="custom-quill"
        style={{ height: '100%', color: '#ffffff' }}
      />
    </div>
  );
};

export default RichTextEditor;