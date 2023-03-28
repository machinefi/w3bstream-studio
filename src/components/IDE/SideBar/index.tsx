import React, { useEffect } from 'react';
import { Flex, Box, Stack, Text, FlexProps, Tooltip, Button, useDisclosure, Collapse } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { MdAddBox, MdRefresh } from 'react-icons/md';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { FilesItem } from './filesItem';
import toast from 'react-hot-toast';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { TableType } from '@/server/routers/pg';
import { hooks } from '@/lib/hooks';

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const {
    w3s,
    base: { confirm }
  } = useStore();
  const { allProjects, curProject } = w3s.project;

  return (
    <Box h="100%" border="1px solid rgba(0, 0, 0, 0.06)" {...props}>
      <Flex alignItems="center" justifyContent="space-between" h="60px" p={2} borderBottom="1px solid rgba(0, 0, 0, 0.06)">
        <Text fontSize="16px" fontWeight={700}>
          W3bstream Studio
        </Text>
        <Flex alignItems="center">
          <Tooltip hasArrow label="Add Project" placement="bottom">
            <Button
              p={2}
              variant="ghost"
              onClick={async (e) => {
                w3s.project.createProject();
              }}
            >
              <Icon as={MdAddBox} color="#946FFF" />
            </Button>
          </Tooltip>
          <Tooltip hasArrow label="Reload Project" placement="bottom">
            <Button
              p={2}
              variant="ghost"
              onClick={async () => {
                await allProjects.call();
                w3s.projectManager.sync();
                toast.success('Reloaded');
              }}
            >
              <Icon as={MdRefresh} color="#946FFF" />
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'CURRENT_PUBLISHERS' || w3s.showContent === 'CURRENT_EVENT_LOGS') && (
        <Box h="calc(100vh - 100px)" overflowY="auto">
          {allProjects.value.map((p, index) => {
            return (
              <Flex
                alignItems="center"
                justifyContent="space-between"
                minH="40px"
                py="2"
                px="6"
                bg="#FAFAFA"
                borderBottom="2px solid rgba(0, 0, 0, 0.06)"
                cursor="pointer"
                sx={getSelectedStyles(allProjects.currentIndex === index)}
                onClick={(e) => {
                  allProjects.onSelect(index);
                }}
              >
                <Box maxW="200px" lineHeight="28px" fontSize="14px" fontWeight={700}>
                  {p.f_name}
                </Box>
                <Flex alignItems="center">
                  <Tooltip hasArrow label="Edit Project" placement="bottom">
                    <EditIcon
                      boxSize={4}
                      cursor="pointer"
                      onClick={async (e) => {
                        e.stopPropagation();
                        allProjects.onSelect(index);
                        w3s.project.form.value.set({
                          name: curProject?.f_name
                        });
                        w3s.project.editProject();
                      }}
                    />
                  </Tooltip>
                  <Tooltip hasArrow label="Delete Project" placement="bottom">
                    <DeleteIcon
                      ml="12px"
                      boxSize={4}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirm.show({
                          title: 'Warning',
                          description: 'Are you sure you want to delete it?',
                          async onOk() {
                            await axios.request({
                              method: 'delete',
                              url: `/api/w3bapp/project/${p.f_name}`
                            });
                            eventBus.emit('project.delete');
                            toast.success('Deleted successfully');
                          }
                        });
                      }}
                    />
                  </Tooltip>
                </Flex>
              </Flex>
            );
          })}
        </Box>
      )}
      {(w3s.showContent === 'ALL_APPLETS' || w3s.showContent === 'ALL_INSTANCES' || w3s.showContent === 'STRATEGIES' || w3s.showContent === 'ALL_PUBLISHERS') && (
        <>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'ALL_APPLETS')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'ALL_APPLETS';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Applets
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'ALL_INSTANCES')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'ALL_INSTANCES';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Instances
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'STRATEGIES')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'STRATEGIES';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Strategies
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'ALL_PUBLISHERS')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'ALL_PUBLISHERS';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Publishers
            </Text>
          </Flex>
        </>
      )}
      {(w3s.showContent === 'CONTRACT_LOGS' || w3s.showContent === 'CHAIN_TX' || w3s.showContent === 'CHAIN_HEIGHT') && (
        <>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'CONTRACT_LOGS')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'CONTRACT_LOGS';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Smart Contract Monitor
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'CHAIN_TX')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'CHAIN_TX';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Chain Transaction Monitor
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'CHAIN_HEIGHT')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'CHAIN_HEIGHT';
            }}
          >
            <Text fontSize="16px" fontWeight={700}>
              Chain Height Monitor
            </Text>
          </Flex>
        </>
      )}
      {w3s.showContent === 'EDITOR' && (
        <>
          <Flex alignItems="center" justifyContent="space-between" p={2} bg="#FAFAFA">
            <Text cursor="pointer">Files</Text>
          </Flex>
          <Stack mt={1} h="calc(100vh - 100px)" overflowY="auto">
            <FilesItem />
          </Stack>
        </>
      )}
      {w3s.showContent === 'DB_TABLE' && (
        <Box h="calc(100vh - 60px)" overflowY="auto">
          <DBTableSideBar />
        </Box>
      )}
      {w3s.showContent === 'METRICS' && (
        <Box h="calc(100vh - 100px)" overflowY="auto">
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="40px"
            py="2"
            px="6"
            bg="#FAFAFA"
            borderBottom="2px solid rgba(0, 0, 0, 0.06)"
            cursor="pointer"
            sx={getSelectedStyles(w3s.metrics.showContent === 'DATABASE')}
            onClick={(e) => {
              w3s.metrics.showContent = 'DATABASE';
            }}
          >
            <Text lineHeight="28px" fontSize="14px" fontWeight={700}>
              Database
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="40px"
            py="2"
            px="6"
            bg="#FAFAFA"
            borderBottom="2px solid rgba(0, 0, 0, 0.06)"
            cursor="pointer"
            sx={getSelectedStyles(w3s.metrics.showContent === 'API')}
            onClick={(e) => {
              w3s.metrics.showContent = 'API';
            }}
          >
            <Text lineHeight="28px" fontSize="14px" fontWeight={700}>
              API
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
});

export const DBTableSideBar = observer(() => {
  const {
    w3s: {
      dbTable: { allTableNames }
    }
  } = useStore();

  useEffect(() => {
    allTableNames.call();
  }, []);

  // if (allTableNames.loading.value) {
  //   return (
  //     <Flex w="100%" h="100%" justify="center">
  //       <Spinner mt="100px" />
  //     </Flex>
  //   );
  // }

  if (!allTableNames.value) {
    return null;
  }

  return (
    <>
      {Object.keys(allTableNames.value).map((key) => {
        return <TableNames key={key} tableSchema={key} tables={allTableNames.value[key]} />;
      })}
    </>
  );
});

const TableNames = observer(({ tableSchema, tables }: { tableSchema: string; tables: TableType[] }) => {
  const {
    w3s: { dbTable },
    base: { confirm }
  } = useStore();
  const collaspeState = useDisclosure({
    defaultIsOpen: true
  });

  return (
    <Box borderBottom="1px solid rgba(0, 0, 0, 0.06)" cursor="pointer">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        py={1}
        px={2}
        borderBottom="1px solid rgba(0, 0, 0, 0.06)"
        cursor="pointer"
        onClick={() => {
          collaspeState.onToggle();
        }}
      >
        <Flex alignItems="center">
          <Icon as={collaspeState.isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={8} cursor="pointer" />
          <Box w="220px" fontSize="16px" fontWeight={700}>
            {tableSchema}
          </Box>
        </Flex>
        <Flex alignItems="center">
          <Tooltip hasArrow label="Create a new table" placement="bottom">
            <Button
              p={0}
              variant="ghost"
              onClick={async (e) => {
                e.stopPropagation();
                dbTable.resetWidgetColumns();
                const formData = await hooks.getFormData({
                  title: `Create a new table under '${tableSchema}'`,
                  size: '6xl',
                  formList: [
                    {
                      form: dbTable.createTableForm
                    }
                  ]
                });
                if (formData.name) {
                  dbTable.createTableAndColumn({
                    tableSchema,
                    formData
                  });
                }
              }}
            >
              <Icon as={MdAddBox} color="#946FFF" />
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      <Collapse in={collaspeState.isOpen}>
        {tables.map((item) => {
          return (
            <Flex
              key={item.tableName}
              alignItems="center"
              justifyContent="space-between"
              py={1}
              px={6}
              borderBottom="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(dbTable.currentTable.tableId === item.tableId)}
              cursor="pointer"
              onClick={() => {
                if (item.disabled && dbTable.mode !== 'VIEW_DATA') {
                  dbTable.setMode('VIEW_DATA');
                }
                dbTable.setCurrentTable({
                  tableSchema,
                  tableId: item.tableId,
                  tableName: item.tableName,
                  disabled: item.disabled
                });
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                {item.tableName}
              </Text>
              {!item.disabled && (
                <Flex alignItems="center">
                  <Tooltip hasArrow label="Delete Table" placement="bottom">
                    <DeleteIcon
                      boxSize={4}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirm.show({
                          title: `Confirm deletion of table "${item.tableName}"`,
                          description: 'Are you sure you want to delete the selected table?',
                          async onOk() {
                            await dbTable.deleteTable({
                              tableId: item.tableId,
                              cascade: true
                            });
                          }
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip hasArrow label="Edit Table" placement="bottom">
                    <EditIcon
                      ml="12px"
                      boxSize={4}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dbTable.setCurrentTable({
                          tableSchema,
                          tableId: item.tableId,
                          tableName: item.tableName,
                          disabled: item.disabled
                        });
                        dbTable.setMode('EDIT_TABLE');
                      }}
                    />
                  </Tooltip>
                  <Tooltip hasArrow label="View Data" placement="bottom">
                    <ViewIcon
                      ml="12px"
                      boxSize={4}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dbTable.setCurrentTable({
                          tableSchema,
                          tableId: item.tableId,
                          tableName: item.tableName,
                          disabled: item.disabled
                        });
                        dbTable.setMode('VIEW_DATA');
                      }}
                    />
                  </Tooltip>
                </Flex>
              )}
            </Flex>
          );
        })}
      </Collapse>
    </Box>
  );
});

function getSelectedStyles(selected: boolean) {
  return selected
    ? {
        color: '#946FFF',
        bg: 'rgba(148, 111, 255, 0.1)'
      }
    : {
        color: '#283241'
      };
}

export default SideBar;
