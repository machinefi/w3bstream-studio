import {
  Box,
  Flex,
  Stack,
  Text,
  Input,
  Button,
  Checkbox,
  Divider,
  Select,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { WidgetColumn } from '@/postgres-meta/helpers';

// const ColumnTypes = ['int4', 'int8', 'float4', 'float8', 'numeric', 'json', 'jsonb', 'text', 'varchar', 'uuid', 'time', 'timetz', 'timestamp', 'timestamptz', 'date', 'bool', 'bytea'];
const ColumnTypes = [
  {
    type: 'int4',
    name: 'Int32'
  },
  {
    type: 'int8',
    name: 'Int64'
  },
  {
    type: 'float4',
    name: 'Float32'
  },
  {
    type: 'float8',
    name: 'Float64'
  },
  {
    type: 'numeric',
    name: 'Decimal'
  },
  {
    type: 'json',
    name: 'JSON'
  },
  {
    type: 'jsonb',
    name: 'JSONB'
  },
  {
    type: 'text',
    name: 'String'
  },
  {
    type: 'varchar',
    name: 'VarChar'
  },
  {
    type: 'uuid',
    name: 'UUID'
  },
  {
    type: 'time',
    name: 'Time'
  },
  {
    type: 'timestamp',
    name: 'Timestamp'
  },
  {
    type: 'timestamptz',
    name: 'Timestamp with Timezone'
  },
  {
    type: 'date',
    name: 'Date'
  },
  {
    type: 'bool',
    name: 'Bool'
  },
  {
    type: 'bytea',
    name: 'Bytes'
  }
];

const getMenuValue = (type: string) => {
  if (type === 'text' || type === 'varchar') {
    return [
      {
        value: 'NULL',
        desc: 'Set the default value as NULL value'
      },
      {
        value: `Empty string`,
        desc: 'Set the default value as an empty string'
      }
    ];
  }
  if (type === 'uuid') {
    return [
      {
        value: 'uuid_generate_v4()',
        desc: 'Generates a version 4 UUID'
      }
    ];
  }
  if (type === 'time' || type === 'timetz' || type === 'timestamp' || type === 'timestamptz') {
    return [
      {
        value: 'now()',
        desc: 'Returns the current date and time'
      },
      {
        value: `(now() at time zone 'utc')`,
        desc: 'Returns the current date and time based on the specified timezone'
      }
    ];
  }

  return null;
};

const getExtraOptions = (item: WidgetColumn) => {
  const { type } = item;
  if (type.includes('int')) {
    if (item.isPrimaryKey) {
      return [
        {
          value: item.isUnique,
          field: 'isUnique',
          label: 'Is Unique',
          desc: 'Enforce if values in the column should be unique across rows'
        },
        {
          value: item.isIdentity,
          field: 'isIdentity',
          label: 'Is Identity',
          desc: 'Automatically assign a sequential unique number to the column'
        }
      ];
    } else {
      return [
        {
          value: item.isUnique,
          field: 'isUnique',
          label: 'Is Unique',
          desc: 'Enforce if values in the column should be unique across rows'
        },
        // {
        //   value: item.isIdentity,
        //   field: 'isIdentity',
        //   label: 'Is Identity',
        //   desc: 'Automatically assign a sequential unique number to the column'
        // },
        {
          value: !!item.isNullable,
          field: 'isNullable',
          label: 'Is Nullable',
          desc: 'Specify if the column can assume a NULL value if no value is provided'
        },
        {
          value: !!item.isDefineASArray,
          field: 'isDefineASArray',
          label: 'Define as Array',
          desc: 'Define your column as a variable-length multidimensional array'
        }
      ];
    }
  } else {
    if (!item.isPrimaryKey) {
      return [
        {
          value: item.isUnique,
          field: 'isUnique',
          label: 'Is Unique',
          desc: 'Enforce if values in the column should be unique across rows'
        },
        {
          value: !!item.isNullable,
          field: 'isNullable',
          label: 'Is Nullable',
          desc: 'Specify if the column can assume a NULL value if no value is provided'
        },
        {
          value: !!item.isDefineASArray,
          field: 'isDefineASArray',
          label: 'Define as Array',
          desc: 'Define your column as a variable-length multidimensional array'
        }
      ];
    }
  }

  return null;
};

const DefaultValueMenu = observer(({ column }: { column: WidgetColumn }) => {
  const {
    w3s: {
      dbTable,
      dbTable: { currentWidgetColumn }
    }
  } = useStore();
  const columnData = column ? column : currentWidgetColumn;
  const menuList = getMenuValue(columnData.type);
  if (!menuList) {
    return null;
  }
  return (
    <Box pos="absolute" right="0" top="0" >
      <Menu size="sm">
        <MenuButton size="sm" as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
        <MenuList >
          {menuList.map((item) => {
            return (
              <MenuItem

                key={item.value}
                onClick={() => {
                  if (column) {
                    dbTable.onChangeWidgetColumn({
                      ...column,
                      defaultValue: item.value
                    });
                  } else {
                    dbTable.setCurrentWidgetColumn({
                      defaultValue: item.value
                    });
                  }
                }}
              >
                <Box>
                  <Text fontWeight={600} fontSize={"12px"}>{item.value}</Text>
                  <Text fontWeight={400} fontSize={"10px"} color="gray.500">{item.desc}</Text>
                </Box>
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </Box>
  );
});

const ExtraOptions = observer(({ column }: { column: WidgetColumn }) => {
  const {
    w3s: {
      dbTable,
      dbTable: { currentWidgetColumn }
    }
  } = useStore();
  const options = getExtraOptions(column || currentWidgetColumn);
  if (!options) {
    return null;
  }
  return (
    <Popover>
      <PopoverTrigger>
        <SettingsIcon cursor="pointer" />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="bold" fontSize={"14px"} border="0">
          Extra Options
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          {options.map((item) => {
            return (
              <Box key={item.label} mb="10px">
                <Checkbox
                  size={"sm"}
                  disabled={item.field === 'isIdentity'}
                  colorScheme="green"
                  fontWeight={600}
                  isChecked={item.value}

                  sx={{
                    '& > .chakra-checkbox__control[data-checked]': {
                      background: '#946FFF',
                      borderColor: '#946FFF',
                      '&:hover': {
                        background: '#946FFF',
                        borderColor: '#946FFF'
                      },
                      '&[data-hover]': {
                        background: '#946FFF',
                        borderColor: '#946FFF'
                      }
                    }
                  }}
                  onChange={(e) => {
                    if (column) {
                      dbTable.onChangeWidgetColumn({
                        ...column,
                        [item.field]: e.target.checked
                      });
                    } else {
                      dbTable.setCurrentWidgetColumn({
                        [item.field]: e.target.checked
                      });
                    }
                  }}
                >
                  <Text fontSize={"12px"}>{item.label}</Text>
                </Checkbox>
                <Text pl="22px" fontSize={"10px"} color="gray.500">{item.desc}</Text>
              </Box>
            );
          })}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

const ColumnItem = observer(({ item, index }: { item?: WidgetColumn; index?: number }) => {
  const {
    w3s: {
      dbTable,
      dbTable: { currentWidgetColumn }
    }
  } = useStore();

  const columnData = item ? item : currentWidgetColumn;

  return (
    <Flex w="100%">
      <Input
        w="200px"
        placeholder="column_name"
        size="sm"
        value={columnData.name}
        onChange={(e) => {
          if (item) {
            dbTable.onChangeWidgetColumn({
              ...item,
              name: e.target.value
            });
          } else {
            dbTable.setCurrentWidgetColumn({
              name: e.target.value
            });
          }
        }}
      />
      <Select
        ml="10px"
        w="300px"
        size="sm"
        placeholder=" --- "
        value={columnData.type}
        onChange={(e) => {
          if (item) {
            dbTable.onChangeWidgetColumn({
              ...item,
              type: e.target.value
            });
          } else {
            dbTable.setCurrentWidgetColumn({
              type: e.target.value
            });
          }
        }}
      >
        {ColumnTypes.map(({ type, name }) => (
          <option key={type} value={type}>
            {name}
          </option>
        ))}
      </Select>
      <Flex ml="10px" w="250px" pos="relative">
        <Input
          placeholder="NULL"
          size="sm"
          disabled={index === 0}
          value={columnData.defaultValue}
          onChange={(e) => {
            if (item) {
              dbTable.onChangeWidgetColumn({
                ...item,
                defaultValue: e.target.value
              });
            } else {
              dbTable.setCurrentWidgetColumn({
                defaultValue: e.target.value
              });
            }
          }}
        />
        <DefaultValueMenu column={item} />
      </Flex>
      <Flex justify="center" ml="10px" w="100px">
        <Checkbox
          isChecked={columnData.isPrimaryKey}
          size="sm"
          sx={{
            '& > .chakra-checkbox__control[data-checked]': {
              background: '#946FFF',
              borderColor: '#946FFF',
              '&:hover': {
                background: '#946FFF',
                borderColor: '#946FFF'
              },
              '&[data-hover]': {
                background: '#946FFF',
                borderColor: '#946FFF'
              }
            }
          }}
          onChange={(e) => {
            const isPrimaryKey = e.target.checked;
            if (item) {
              dbTable.onChangeWidgetColumn({
                ...item,
                isPrimaryKey,
                isIdentity: isPrimaryKey
              });
            } else {
              dbTable.setCurrentWidgetColumn({
                isPrimaryKey,
                isIdentity: isPrimaryKey
              });
            }
          }}
        />
      </Flex>
      <Flex justify="center" align="center" ml="10px" w="50px">
        <ExtraOptions column={item} />
      </Flex>
      {item && (
        <Button
          ml="30px"
          w="50px"
          size="sm"
          variant="outline"
          onClick={() => {
            dbTable.onDeleteWidgetColumn(item.id);
          }}
        >
          <DeleteIcon />
        </Button>
      )}
    </Flex>
  );
});

const Header = () => {
  return (
    <Flex w="100%">
      <Text w="200px" textAlign="center" fontSize={"14px"} fontWeight={600}>
        Name
      </Text>
      <Text ml="10px" w="300px" textAlign="center" fontSize={"14px"} fontWeight={600}>
        Type
      </Text>
      <Text ml="10px" w="250px" textAlign="center" fontSize={"14px"} fontWeight={600}>
        Default Value
      </Text>
      <Text ml="10px" w="100px" textAlign="center" fontSize={"14px"} fontWeight={600}>
        Primary
      </Text>
      <Text ml="10px" w="50px" textAlign="center" fontSize={"14px"} fontWeight={600}></Text>
    </Flex>
  );
};

export const TableColumns = observer(() => {
  const {
    w3s: {
      dbTable,
      dbTable: { widgetColumns }
    }
  } = useStore();

  return (
    <Stack mt="10px" minH={340}>
      <Divider />
      {/* <Box fontWeight={600}>Columns</Box> */}
      <Header />
      {widgetColumns.map((item, index) => (
        <ColumnItem key={item.id} item={item} index={index} />
      ))}
      <Flex>
        <Button
          size="sm"
          mt="10px"
          // variant="outline"
          fontWeight={500}
          onClick={() => {
            dbTable.onAddWidgetColumn();
          }}
        >
          + Add Column
        </Button>
      </Flex>
    </Stack>
  );
});

export const ColumnItemWidget = () => {
  return (
    <>
      <Box my="20px">
        <Header />
      </Box>
      <ColumnItem />
    </>
  );
};

export const TableColumnsWidget = () => {
  return <TableColumns />;
};
