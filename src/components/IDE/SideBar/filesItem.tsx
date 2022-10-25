import { useEffect, useRef, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { Tree } from '@/components/Tree';

export const FilesItem = observer(() => {
  const { w3s } = useStore();
  const store = useLocalObservable(() => ({
    selectedNodeKey: null,
    expandedKeys: {},
    onSelect(file: FilesItemType) {
      if (file.type == 'file') {
        w3s.projectManager.curFilesListSchema.setCurActiveFile(file);
      }
    }
  }));

  const cm = useRef(null);

  const menu: any = [
    {
      label: 'View Key',
      icon: 'pi pi-search',
      command: (e) => {
        console.log(store.selectedNodeKey);
      }
    },
    {
      label: 'Toggle',
      icon: 'pi pi-cog',
      command: (e) => {
        let _expandedKeys = { ...store.expandedKeys };
        if (_expandedKeys[store.selectedNodeKey]) delete _expandedKeys[store.selectedNodeKey];
        else _expandedKeys[store.selectedNodeKey] = true;
        store.expandedKeys = _expandedKeys;
      }
    }
  ];

  return (
    <>
      <Tree data={w3s.projectManager.curFilesList} onSelect={store.onSelect} />
    </>
  );
});
