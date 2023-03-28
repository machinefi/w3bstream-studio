import {
  Box,
  Flex,
  Stack,
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
import { WidgetColumn } from '@/store/lib/w3bstream/schema/dbTable';

const ColumnTypes = ['int4', 'int8', 'float4', 'float8', 'numeric', 'json', 'jsonb', 'text', 'varchar', 'uuid', 'time', 'timetz', 'timestamp', 'timestamptz', 'date', 'bool', 'bytea'];

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
        {
          value: item.isIdentity,
          field: 'isIdentity',
          label: 'Is Identity',
          desc: 'Automatically assign a sequential unique number to the column'
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
    <Box pos="absolute" right="0" top="0">
      <Menu>
        <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
        <MenuList>
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
                  <Box fontWeight={700}>{item.value}</Box>
                  <Box>{item.desc}</Box>
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
        <PopoverHeader pt={4} fontWeight="bold" border="0">
          Extra Options
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          {options.map((item) => {
            return (
              <Box key={item.label} mb="10px">
                <Checkbox
                  colorScheme="green"
                  fontWeight={700}
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
                  {item.label}
                </Checkbox>
                <Box pl="22px">{item.desc}</Box>
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
        size="md"
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
        {ColumnTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Flex ml="10px" w="250px" pos="relative">
        <Input
          placeholder="NULL"
          size="md"
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
            if (item) {
              dbTable.onChangeWidgetColumn({
                ...item,
                isPrimaryKey: e.target.checked
              });
            } else {
              dbTable.setCurrentWidgetColumn({
                isPrimaryKey: e.target.checked
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
      <Box w="200px" textAlign="center">
        Name
      </Box>
      <Box ml="10px" w="300px" textAlign="center">
        Type
      </Box>
      <Box ml="10px" w="250px" textAlign="center">
        Default Value
      </Box>
      <Box ml="10px" w="100px" textAlign="center">
        Primary
      </Box>
      <Box ml="10px" w="50px" textAlign="center"></Box>
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
    <Stack mt="10px">
      <Divider />
      <Box fontWeight={600}>Columns</Box>
      <Header />
      {widgetColumns.map((item, index) => (
        <ColumnItem key={item.id} item={item} index={index} />
      ))}
      <Flex>
        <Button
          variant="outline"
          fontWeight={400}
          onClick={() => {
            dbTable.onAddWidgetColumn();
          }}
        >
          Add Column
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
