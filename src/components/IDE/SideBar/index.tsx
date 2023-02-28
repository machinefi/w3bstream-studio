import React, { useEffect } from 'react';
import { Flex, Box, Stack, Text, FlexProps, Tooltip, Button, useDisclosure, Collapse, Spinner } from '@chakra-ui/react';
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

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

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
              <Icon as={MdAddBox} />
            </Button>
          </Tooltip>
          <Tooltip hasArrow label="Reload Project" placement="bottom">
            <Button
              p={2}
              variant="ghost"
              onClick={async () => {
                await w3s.allProjects.call();
                w3s.projectManager.sync();
                toast.success('Reloaded');
              }}
            >
              <Icon as={MdRefresh} />
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'CURRENT_PUBLISHERS') && (
        <Box h="calc(100vh - 100px)" overflowY="auto">
          {w3s.allProjects.value.map((p, index) => {
            return (
              <Flex
                alignItems="center"
                justifyContent="space-between"
                h="40px"
                py="2"
                px="6"
                bg="#FAFAFA"
                borderBottom="2px solid rgba(0, 0, 0, 0.06)"
                cursor="pointer"
                sx={getSelectedStyles(w3s.allProjects.currentIndex === index)}
                onClick={(e) => {
                  w3s.allProjects.onSelect(index);
                }}
              >
                <Text lineHeight="28px" fontSize="14px" fontWeight={700}>
                  {p.f_name}
                </Text>
                <Flex alignItems="center">
                  <Tooltip hasArrow label="Edit Project" placement="bottom">
                    <EditIcon
                      boxSize={4}
                      cursor="pointer"
                      onClick={async (e) => {
                        e.stopPropagation();
                        w3s.allProjects.onSelect(index);
                        w3s.project.form.value.set({
                          name: w3s.curProject.f_name
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
      {(w3s.showContent === 'ALL_APPLETS' || w3s.showContent === 'ALL_INSTANCES' || w3s.showContent === 'ALL_STRATEGIES' || w3s.showContent === 'ALL_PUBLISHERS') && (
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
            sx={getSelectedStyles(w3s.showContent === 'ALL_STRATEGIES')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'ALL_STRATEGIES';
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
      {(w3s.showContent === 'ALL_CONTRACT_LOGS' || w3s.showContent === 'All_CHAIN_TX' || w3s.showContent === 'All_CHAIN_HEIGHT') && (
        <>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            h="60px"
            py="2"
            px="6"
            borderBottom="1px solid rgba(0, 0, 0, 0.06)"
            sx={getSelectedStyles(w3s.showContent === 'ALL_CONTRACT_LOGS')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'ALL_CONTRACT_LOGS';
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
            sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_TX')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'All_CHAIN_TX';
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
            sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_HEIGHT')}
            cursor="pointer"
            onClick={() => {
              w3s.showContent = 'All_CHAIN_HEIGHT';
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
      {w3s.showContent === 'DB_TABLE' && <DBTable />}
    </Box>
  );
});

const DBTable = observer(() => {
  const {
    w3s: {
      dbTable: { allTableNames }
    }
  } = useStore();

  useEffect(() => {
    if (!allTableNames.value) {
      allTableNames.call();
    }
  }, []);

  if (allTableNames.loading.value) {
    return (
      <Flex w="100%" h="100%" justify="center">
        <Spinner mt="100px" />
      </Flex>
    );
  }

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
          <Text fontSize="16px" fontWeight={700}>
            {tableSchema}
          </Text>
        </Flex>
        <Flex alignItems="center">
          <Tooltip hasArrow label="Create a new table" placement="bottom">
            <Button
              p={0}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Icon as={MdAddBox} />
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
                dbTable.setCurrentTable({
                  tableSchema,
                  tableId: item.tableId,
                  tableName: item.tableName
                });
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                {item.tableName}
              </Text>
              <Flex alignItems="center">
                <Tooltip hasArrow label="Delete Table" placement="bottom">
                  <DeleteIcon
                    boxSize={4}
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirm.show({
                        title: 'Warning',
                        description: 'Are you sure you want to delete it?',
                        async onOk() {}
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
                        tableName: item.tableName
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
                        tableName: item.tableName
                      });
                      dbTable.setMode('VIEW_DATA');
                    }}
                  />
                </Tooltip>
              </Flex>
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
        color: '#4689F7',
        bg: '#EDF3FA'
      }
    : {
        color: '#283241'
      };
}

export default SideBar;
