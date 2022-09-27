import Editor from '@monaco-editor/react';

const EditorComponent = () => {
  return <Editor height="90vh" theme="vs-dark" defaultLanguage="typescript" defaultValue="// some comment" />;
};

export default EditorComponent;
