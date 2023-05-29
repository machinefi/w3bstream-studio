import { assemblyscriptJSONDTS } from '@/server/wasmvm/assemblyscript-json-d';
import { useStore } from '@/store/index';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { observer } from 'mobx-react-lite';
import { asc } from 'pages/_app';

export const MoEditor = observer((props: any) => {
  const {
    w3s: {
      projectManager: { curFilesListSchema }
    }
  } = useStore();

  const monaco = useMonaco();
  if (monaco) {
    monaco.languages.register({ id: 'env' });
    monaco.languages.setMonarchTokensProvider('myEnv', {
      tokenizer: {
        root: [
          [/^[^=]+/, 'identifier'],
          [/=/, 'delimiter'],
          [/[^=]+$/, 'string']
        ]
      }
    });
  }
  return (
    <>
      <MonacoEditor
        options={{
          minimap: {
            enabled: false
          }
        }}
        width={'100%'}
        height={500}
        key={curFilesListSchema?.curActiveFile.data?.language}
        theme="vs-dark"
        defaultLanguage={curFilesListSchema?.curActiveFile.data?.language}
        language={curFilesListSchema?.curActiveFile.data?.language}
        defaultValue="export function test(): void {}"
        value={curFilesListSchema?.curActiveFile?.data?.code}
        beforeMount={(monaco) => { }}
        onMount={async (editor, monaco) => {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `
      declare const Log: (message:string) => void;
      declare const SetDB: (key: string, value: number) => void;
      declare const GetDB: (key: string) => string;
      declare const SendTx: (chainId: number, to:string, value:string ,data:string) => string | null;
      declare const GetDataByRID: (rid: number) => string;
      declare const ExecSQL: (query: string,args?:any[]) => i32;
      declare const QuerySQL: (query: string,args?:any[]) => string;
      declare const GetEnv: (key:string) => string;
      declare const faker: any;
      declare const CallContract:(chainId: number, to:string, data:string) => string;
      declare const hexToUtf8(hex: string): string;
      declare const hexToInt(hex: string): i32;
      declare const hexToBool(hex: string): bool;
      declare const hexToAddress(hex: string): string;
      declare class Wallet {
        accountAddress: Address
        constructor();
      };
      declare class BlockChain {
        block: Block
        constructor();
        async deploy(contract: string, wallet: Wallet): { contractAddress: Address, contractInstance: Contract };
      }
      `,
            'sdk/index.d.ts'
          );
          monaco.languages.typescript.typescriptDefaults.addExtraLib(assemblyscriptJSONDTS, 'assemblyscript-json/index.d.ts');
          if (asc) monaco.languages.typescript.typescriptDefaults.addExtraLib(asc.definitionFiles.assembly, 'assemblyscript/std/assembly/index.d.ts');
        }}
        onChange={(e) => {
          curFilesListSchema.setCurFileCode(e);
        }}
        {...props}
      />
    </>
  );
});
