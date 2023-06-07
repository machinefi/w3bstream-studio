import { useStore } from '@/store/index';
import { FilesItemType, VSCodeRemoteFolderName } from '@/store/lib/w3bstream/schema/filesList';
import { observer, useLocalObservable } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import { hooks } from '@/lib/hooks';
import { Image, ImageProps, Box, Flex, Portal, Text, Tooltip, Divider, Center, Spinner } from '@chakra-ui/react';
import { VscCloudDownload, VscDebugStart, VscFile, VscFiles, VscFileSymlinkFile, VscFileZip, VscFolder, VscTrash } from 'react-icons/vsc';
import { BiMemoryCard, BiPaste, BiRename } from 'react-icons/bi';
import { compileAndCreateProject, debugAssemblyscript, debugSimulation, debugDemo } from '@/components/IDE/Editor/EditorFunctions';
import { AiOutlineSetting } from 'react-icons/ai';
import { GrStatusGoodSmall } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';

export const FileActions = observer(({ item }: { item: FilesItemType }) => {
  const {
    w3s,
    w3s: {
      projectManager,
      projectManager: { curFilesListSchema }
    }
  } = useStore();
  const { t } = useTranslation();
  return (
    <>
      {item.isRename ? (
        <input
          autoFocus
          type="text"
          style={{ outline: 'none', color: '#000', width: '130px' }}
          value={item.label}
          onChange={(e) => {
            item.label = e.target.value;
          }}
          onBlur={() => {
            if (item.label == '') return toast.error('name can not empty');
            item.isRename = false;
          }}
        ></input>
      ) : (
        <Box
          cursor={'text'}
          as="span"
          fontSize={'14px'}
          fontWeight={600}
          userSelect="none"
          onDoubleClick={(e) => {
            e.stopPropagation();
            item.isRename = true;
          }}
        >
          {item.label}
        </Box>
      )}
      {item.label == VSCodeRemoteFolderName && <VSCodeRemoteState />}
      {item.label == VSCodeRemoteFolderName && <VscodeRemoteSettingButton />}
      {item.label == VSCodeRemoteFolderName && w3s.projectManager.isWSConnect && <VscodeRemoteCompilerButton />}

      {item?.data?.size != null && (
        <Box ml="auto" color="gray" fontSize={'12px'}>
          {item?.data?.size}kb
        </Box>
      )}

      {(item?.data?.dataType == 'assemblyscript' || item?.data?.dataType == 'wasm') && curFilesListSchema?.curActiveFileId == item?.key && (
        <>
          <Tooltip label={`Upload to Devnet`} placement="top">
            <Text
              ml="auto"
              cursor="pointer"
              mr={4}
              className="pi pi-cloud-upload"
              color="black"
              onClick={async () => {
                compileAndCreateProject(item?.data?.dataType == 'assemblyscript');
              }}
            ></Text>
          </Tooltip>

          <Box position={'relative'}>
            <Box
              onClick={() => {
                debugAssemblyscript(item?.data?.dataType == 'assemblyscript');
              }}
            >
              <VscDebugStart
                color="black"
                style={{
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {item?.data?.dataType == 'simulation' && curFilesListSchema?.curActiveFileId == item?.key && (
        <Box ml="auto">
          <Box onClick={debugSimulation}>
            <VscDebugStart
              color="black"
              style={{
                marginRight: '10px',
                cursor: 'pointer'
              }}
            />
          </Box>
        </Box>
      )}

      {item?.data?.dataType == 'demo' && curFilesListSchema?.curActiveFileId == item?.key && (
        <Box ml="auto">
          <Box
            w="22px"
            h="22px"
            onClick={() => {
              debugDemo.call();
            }}
          >
            {debugDemo.loading.value ? (
              <Spinner size="sm" color="#946FFF" />
            ) : (
              <VscDebugStart
                color="black"
                style={{
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </>
  );
});

export const VscodeRemoteCompilerButton = () => {
  const {
    w3s,
    w3s: { projectManager }
  } = useStore();
  const { t } = useTranslation();
  return (
    <Tooltip label="Compile">
      <Center
        px={1}
        borderRadius={'3px'}
        onClick={async (e) => {
          e.stopPropagation();
          projectManager.compiler();
        }}
      >
        <BiMemoryCard />
      </Center>
    </Tooltip>
  );
};

export const VscodeRemoteSettingButton = () => {
  const {
    w3s,
    w3s: { projectManager }
  } = useStore();
  const { t } = useTranslation();
  const curFilekey = w3s.projectManager?.curFilesListSchema?.curActiveFile?.key;
  return (
    <Tooltip label="Setting">
      <Center
        ml="auto"
        px={1}
        borderRadius={'3px'}
        onClick={async (e) => {
          e.stopPropagation();
          // projectManager.setVscodeSettingForm.value.value.port = projectManager.wsPort;
          await hooks.getFormData({
            title: 'VSCode Extension Setting',
            size: '2xl',
            formList: [
              {
                form: projectManager.setVscodeSettingForm
              }
            ]
          });
          await projectManager.uiConnectWs();
        }}
      >
        <AiOutlineSetting />
      </Center>
    </Tooltip>
  );
};

export const VSCodeRemoteState = observer(() => {
  const {
    w3s,
    w3s: { projectManager }
  } = useStore();
  const { t } = useTranslation();
  const curFilekey = w3s.projectManager?.curFilesListSchema?.curActiveFile?.key;
  return (
    <Tooltip
      label={
        w3s.projectManager.isWSConnect ? (
          <Box>
            <Text>Click to stop connect</Text>
            <Text>[Connect port {w3s.projectManager.wsPort} Success]</Text>
          </Box>
        ) : (
          <Box>
            <Text>Click here to connect to the VS Code Plugin.</Text>
            <Text mt={1}>
              If the gray dot doesn't turn green, please make sure you have installed the W3bstream Plugin for VS Code and that it's enabled. Some browsers, like Brave, may block the connection:
              please check the navigation bar for any <i>Blocked Content</i> notification.
            </Text>
          </Box>
        )
      }
    >
      <Box
        ml="1"
        onClick={async (e) => {
          e.stopPropagation();
          if (w3s.projectManager.isWSConnect) {
            await w3s.projectManager.unsubscribe();
          } else {
            await projectManager.uiConnectWs();
          }
        }}
      >
        {projectManager.isWSConnectLoading ? <Spinner h={2} w={2} /> : <GrStatusGoodSmall color={w3s.projectManager.isWSConnect ? 'green' : 'lightgray'} style={{ width: '12px', height: '12px' }} />}
      </Box>
    </Tooltip>
  );
});
