'use client';
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

export default function TinyMCEEditor({ value, onChange, height = 500 }) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey="kcwndjni40bp2u10wm8mf68zfu3z61aey5d7u2m69dru405z" // Usando TinyMCE en modo self-hosted gratuito
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | link image media | code | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        language: 'es',
        branding: false,
        promotion: false,
      }}
    />
  );
}
