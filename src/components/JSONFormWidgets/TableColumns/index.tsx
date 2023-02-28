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

const getMenuValue = (type: string) => {
  if (type === 'text' || type === 'varchar') {
    return [
      {
        value: 'Set as NULL',
        desc: 'Set the default value as NULL value'
      },
      {
        value: `Set as empty string`,
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

const DefaultValueMenu = ({ type }: { type: string }) => {
  const menuList = getMenuValue(type);
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
              <MenuItem key={item.value}>
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

const ExtraOptions = observer(({ column }: { column: WidgetColumn }) => {
  const {
    w3s: { dbTable }
  } = useStore();
  const options = getExtraOptions(column);
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
                  onChange={(e) => {
                    dbTable.onChangeWidgetColumn({
                      ...column,
                      [item.field]: e.target.checked
                    });
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

export const TableColumns = observer(() => {
  const {
    w3s: {
      dbTable,
      dbTable: { widgetColumns }
    }
  } = useStore();

  return (
    <Stack>
      <Divider />
      <Box fontWeight={600}>Columns</Box>
      <Flex w="100%">
        <Box w="200px" textAlign="center">
          Name
        </Box>
        <Box ml="10px" w="300px" textAlign="center">
          Type
        </Box>
        <Box ml="10px" w="200px" textAlign="center">
          Default Value
        </Box>
        <Box ml="10px" w="100px" textAlign="center">
          Primary
        </Box>
        <Box ml="10px" w="50px" textAlign="center"></Box>
      </Flex>
      {widgetColumns.map((item) => (
        <Flex w="100%" key={item.id}>
          <Input
            w="200px"
            placeholder="Name"
            size="md"
            value={item.name}
            onChange={(e) => {
              dbTable.onChangeWidgetColumn({
                ...item,
                name: e.target.value
              });
            }}
          />
          <Select
            ml="10px"
            w="300px"
            placeholder="Type"
            value={item.type}
            onChange={(e) => {
              dbTable.onChangeWidgetColumn({
                ...item,
                type: e.target.value
              });
            }}
          >
            <option value="int2">int2</option>
            <option value="int4">int4</option>
            <option value="int8">int8</option>
            <option value="float4">float4</option>
            <option value="float8">float8</option>
            <option value="numeric">numeric</option>
            <option value="json">json</option>
            <option value="jsonb">jsonb</option>
            <option value="text">text</option>
            <option value="varchar">varchar</option>
            <option value="uuid">uuid</option>
            <option value="date">date</option>
            <option value="time">time</option>
            <option value="timetz">timetz</option>
            <option value="timestamp">timestamp</option>
            <option value="timestamptz">timestamptz</option>
            <option value="bool">bool</option>
          </Select>
          <Flex ml="10px" w="200px" pos="relative">
            <Input
              placeholder="Default Value"
              size="md"
              value={item.defaultValue}
              onChange={(e) => {
                dbTable.onChangeWidgetColumn({
                  ...item,
                  defaultValue: e.target.value
                });
              }}
            />
            <DefaultValueMenu type={item.type} />
          </Flex>
          <Flex justify="center" ml="10px" w="100px">
            <Checkbox
              isChecked={item.isPrimaryKey}
              onChange={(e) => {
                dbTable.onChangeWidgetColumn({
                  ...item,
                  isPrimaryKey: e.target.checked
                });
              }}
            />
          </Flex>
          <Flex justify="center" align="center" ml="10px" w="50px">
            <ExtraOptions column={item} />
          </Flex>
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
        </Flex>
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

export const TableColumnsWidget = () => {
  return <TableColumns />;
};
