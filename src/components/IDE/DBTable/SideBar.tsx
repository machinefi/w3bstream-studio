import React, { useEffect } from 'react';
import { Flex, Box, Text, Tooltip, Button, useDisclosure, Collapse, Spinner } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { MdAddBox } from 'react-icons/md';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { TableType } from '@/server/routers/pg';
import { hooks } from '@/lib/hooks';

export const DBTableSideBar = observer(() => {
  const {
    w3s: {
      dbTable: { allTables }
    }
  } = useStore();

  useEffect(() => {
    allTables.call();
  }, []);

  if (!allTables.value) {
    return null;
  }

  return (
    <>
      {allTables.value.map((item) => {
        return <TableNames key={item.schemaName} tableSchema={item.schemaName} tables={item.tables} />;
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
        pl={1}
        borderBottom="1px solid rgba(0, 0, 0, 0.06)"
        cursor="pointer"
        onClick={() => {
          collaspeState.onToggle();
        }}
      >
        <Flex alignItems="center" overflowX="auto">
          <Icon as={collaspeState.isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={6} cursor="pointer" />
          <Box w="220px" fontSize="16x" fontWeight={700}>
            {tableSchema === 'public' ? "Default" : tableSchema}
          </Box>
        </Flex>
        <Flex alignItems="center">
          {dbTable.allTables.loading.value && <Spinner size="sm" color="#946FFF" />}
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
              px={3}
              borderBottom="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(dbTable.currentTable.tableId === item.tableId)}
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
            >
              <Text
                fontSize="14px"
                fontWeight={600}
                overflowX="auto"
              >
                {item.tableName}
              </Text>
              <Flex ml="5px" alignItems="center">
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
                        tableName: item.tableName
                      });
                      dbTable.setMode('EDIT_TABLE');
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
      color: '#946FFF',
      bg: 'rgba(148, 111, 255, 0.1)'
    }
    : {
      color: '#283241'
    };
}