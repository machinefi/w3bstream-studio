import { ContextMenu as PrContextMenu } from 'primereact/contextmenu';
import { useEffect, useRef, useState } from 'react';
// import { Tree } from 'primereact/tree';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { Box, Flex, Image } from '@chakra-ui/react';
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
      <PrContextMenu ref={cm} model={menu} onHide={() => (store.selectedNodeKey = null)} />
      <Box opacity={0} h={0}>
        {w3s.projectManager.curFilesList?.[0].children.length}
      </Box>
      {/* force update the tree view   */}

      {/* <Tree
        value={w3s.projectManager.curFilesList}
        selectionMode="single"
        selectionKeys={store.selectedNodeKey}
        expandedKeys={store.expandedKeys}
        onSelect={(e) => store.onSelect(e as any)}
        onSelectionChange={(e) => (store.selectedNodeKey = e.value)}
        onToggle={(e) => (store.expandedKeys = e.value)}
        contextMenuSelectionKey={store.selectedNodeKey}
        onContextMenuSelectionChange={(event) => (store.selectedNodeKey = event.value)}
        onContextMenu={(event) => cm.current.show(event.originalEvent)}
      /> */}
      {/* todo:  */}
      {/* <Flex px={4}>
        <Image cursor="pointer" _hover={{opacity:0.8}} w={5} h={5} mr={4} src="/images/icons/new-file.svg" ></Image>
        <Image cursor="pointer" _hover={{opacity:0.8}} w={5} h={5} src="/images/icons/new-folder.svg"></Image>
      </Flex> */}
      <Tree data={w3s.projectManager.curFilesList} onSelect={store.onSelect} />
    </>
  );
});
