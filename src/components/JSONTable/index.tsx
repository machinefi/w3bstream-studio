import React, { useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Button, Table as ChakraTable, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react';
import { PaginationState } from '@/store/standard/PaginationState';
import SimplePagination from '../Common/SimplePagination';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { ActionButtonType, Column, ExtendedTable, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';

export interface JSONTableProps<T> {
  jsonstate: {
    table: JSONSchemaTableState<T>;
  };
}

const JSONTable = observer(<T,>(props: JSONTableProps<T>) => {
  const { columns, dataSource, rowKey, extendedTables = [], initPagination = { page: 1, limit: 8 }, containerProps = {} } = props.jsonstate.table;

  const store = useLocalObservable(() => ({
    paginationState: new PaginationState(initPagination)
  }));

  useEffect(() => {
    store.paginationState.setData({
      total: dataSource.length
    });
  }, [dataSource]);

  // if (!dataSource.length) {
  //   return null;
  // }

  const needExtendedTable = !!extendedTables.length;

  const data = dataSource.slice(store.paginationState.offset, store.paginationState.offset + store.paginationState.limit);

  return (
    <>
      <TableContainer {...containerProps}>
        <ChakraTable>
          <Thead>
            <Tr h="54px" bg="#F5F5F5">
              {needExtendedTable && <Th></Th>}
              {columns.map((item) => (
                <Th key={item.key} fontSize="14px" fontWeight={700} color="#0F0F0F">
                  {item.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item) =>
              needExtendedTable ? <CollapseBody key={item[rowKey]} item={item} columns={columns} extendedTables={extendedTables} /> : <Body key={item[rowKey]} item={item} columns={columns} />
            )}
          </Tbody>
        </ChakraTable>
      </TableContainer>
      <SimplePagination
        mt="10px"
        total={store.paginationState.total}
        limit={store.paginationState.limit}
        page={store.paginationState.page}
        onPageChange={(currentPage) => {
          store.paginationState.setData({
            page: currentPage
          });
        }}
      />
    </>
  );
});

function ActionButton({ props, text }: ActionButtonType) {
  return (
    <Button
      h="32px"
      _hover={{ opacity: 0.8 }}
      _active={{
        opacity: 0.6
      }}
      {...props}
    >
      {text}
    </Button>
  );
}

function Body<T>({ item, columns }: { item: T; columns: Column<T>[] }) {
  return (
    <Tr h="54px" fontSize="14px" color="#0F0F0F">
      {columns.map((column) => {
        return (
          <Td key={column.key}>
            {column.actions ? column.actions(item).map((btn, index) => <ActionButton key={index} props={btn.props} text={btn.text} />) : column.render ? column.render(item) : item[column.key]}
          </Td>
        );
      })}
    </Tr>
  );
}

function CollapseBody<T>({ item, columns, extendedTables }: { item: T; columns: Column<T>[]; extendedTables: ExtendedTable<any>[] }) {
  const { isOpen, onToggle } = useDisclosure();
  const styles = isOpen ? { display: 'table-row' } : { display: 'none' };

  return (
    <>
      <Tr
        h="54px"
        fontSize="14px"
        color="#0F0F0F"
        cursor="pointer"
        onClick={(e: any) => {
          const { nodeName } = e.target;
          if (nodeName === 'TD' || nodeName === 'svg') {
            onToggle();
          }
        }}
      >
        <Td w="40px">{isOpen ? <ChevronDownIcon w={6} h={6} /> : <ChevronRightIcon w={6} h={6} />}</Td>
        {columns.map((column) => {
          return (
            <Td key={column.key}>
              {column.actions ? column.actions(item).map((btn, index) => <ActionButton key={index} props={btn.props} text={btn.text} />) : column.render ? column.render(item) : item[column.key]}
            </Td>
          );
        })}
      </Tr>
      <Tr {...styles}>
        <Td></Td>
        <Td colSpan={columns.length}>
          {extendedTables.map((ex) => {
            const exColumns = ex.columns;
            const exRow = item[ex.key];
            return (
              <TableContainer mb="10px">
                <ChakraTable>
                  <Thead>
                    <Tr h="54px" bg="#F5F5F5">
                      {exColumns.map((exC) => {
                        return (
                          <Th key={exC.key} fontSize="14px" fontWeight={700} color="#0F0F0F">
                            {exC.label}
                          </Th>
                        );
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {exRow.map((exItem) => (
                      <Tr h="54px" fontSize="14px" color="#0F0F0F">
                        {exColumns.map((exC) => {
                          return (
                            <Td key={exC.key}>
                              {exC.actions
                                ? exC.actions(exItem).map((btn, index) => <ActionButton key={index} props={btn.props} text={btn.text} />)
                                : exC.render
                                ? exC.render(exItem)
                                : exItem[exC.key]}
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </ChakraTable>
              </TableContainer>
            );
          })}
        </Td>
      </Tr>
    </>
  );
}

export default JSONTable;
