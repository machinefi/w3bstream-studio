import { ContextMenu as PrContextMenu } from 'primereact/contextmenu';
import { useEffect, useRef, useState } from 'react';
import { Tree } from 'primereact/tree';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';

export const FilesItem = observer(() => {
  const { w3s } = useStore();
  const store = useLocalObservable(() => ({
    nodes: w3s.curFilesList,
    selectedNodeKey: null,
    expandedKeys: {},
    onSelect({ node }: { node: FilesItemType }) {
      if (node.data.type == 'file') {
        w3s.curFilesListSchema.setCurActiveFile(node);
      }
    }
  }));

  useEffect(() => {
    setTimeout(() => {
      console.log(w3s.curFilesList);
    }, 3000);
  }, []);
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
      <PrContextMenu ref={cm} model={menu} onHide={() => (store.selectedNodeKey = null)} />
      <Tree
        value={store.nodes}
        selectionMode="single"
        selectionKeys={store.selectedNodeKey}
        expandedKeys={store.expandedKeys}
        // @ts-ignore
        onSelect={store.onSelect}
        onSelectionChange={(e) => (store.selectedNodeKey = e.value)}
        onToggle={(e) => (store.expandedKeys = e.value)}
        contextMenuSelectionKey={store.selectedNodeKey}
        onContextMenuSelectionChange={(event) => (store.selectedNodeKey = event.value)}
        onContextMenu={(event) => cm.current.show(event.originalEvent)}
      />
    </>
  );
});
