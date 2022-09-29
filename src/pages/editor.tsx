import { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Editor from '@monaco-editor/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
let asc: typeof import('assemblyscript/dist/asc');
import { Button, Container, Group, Tabs } from '@mantine/core';

const Home: NextPage = observer(() => {
  const store = useLocalObservable(() => ({
    curFile: 0,
    //todo: Optimizing the data structure
    files: [
      {
        name: 'module.ts',
        language: 'typescript',
        content: `export function fib(n: i32): i32 {
  var a = 0, b = 1
  if (n > 0) {
    while (--n) {
      let t = a + b
      a = b
      b = t
    }
    return b
  }
  return a
}
`
      },
      {
        name: 'module.wat',
        content: ``,
        raw: '',
        language: 'scheme'
      },
      {
        name: 'index.html',
        content: `<textarea id="output" style="height: 100%; width: 100%" readonly></textarea>
  <script type="module">
  const exports = await instantiate(await compile(), { /* imports */ })
  const output = document.getElementById('output')
  for (let i = 0; i <= 10; ++i) {
    output.value += \`fib(\${i}) = \${exports.fib(i)}\n\`
  }
  </script>
  `,
        raw: '', //base64
        language: 'html'
      }
    ],
    //todo：support other compiler type
    async compile(type = 'AssemblyScript') {
      try {
        const { error, binary, text } = await asc.compileString(store.files[0].content, {
          optimizeLevel: 3,
          runtime: 'stub'
        });
        console.log(binary, text);
        if (error) console.log(error);
        store.files[1].content = text;
        //@ts-ignore
        store.files[1].raw = binary;
        console.log(this.files, this.getCompileScript());
        this.genHTMLRawData();
      } catch (error) {}
    },
    getCompileScript() {
      return `
      <head>
        <script>
          async function compile() {
            return await WebAssembly.compile(new Uint8Array([${this.files[1].raw}]));
          }
          async function instantiate(module, imports = {}) {
            const { exports } = await WebAssembly.instantiate(module, imports);
            return exports;
          }
          </script>
      </head>
      `;
    },
    genHTMLRawData() {
      this.files[2].raw = window.btoa(this.getCompileScript() + this.files[2].content);
    }
  }));

  useEffect(() => {
    const asyncImportASC = async () => {
      asc = await import('assemblyscript/dist/asc');
    };
    asyncImportASC();
  }, []);

  return (
    <Container size="lg" py={40}>
      <Head>
        <title>W3BStream IDE DEMO</title>
      </Head>

      <Group spacing={7}>
        {store.files.map((file, index) => {
          return <Button onClick={() => (store.curFile = index)}>{file.name}</Button>;
        })}
      </Group>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex' }}>
          <Editor
            width={'50%'}
            height={400}
            theme="vs-dark"
            language={store.files[store.curFile].language}
            defaultValue="export function test(): void {}"
            value={store.files[store.curFile].content}
            beforeMount={(monaco) => {
              if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
            }}
            onChange={(e) => {
              console.log(e);
              store.files[store.curFile].content = e;
              store.compile();
            }}
            onMount={(editor, monaco) => {
              store.compile();
            }}
          />

          <iframe frameBorder="0" height={400} src={`data:text/html;base64,${store.files[2]?.raw}`} sandbox="allow-scripts allow-pointer-lock"></iframe>
        </div>
      </main>
    </Container>
  );
});

export default Home;
