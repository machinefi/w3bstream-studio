import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import Pagination from 'rc-pagination';

interface PaginationProps {
  total: number;
  limit: number;
  page: number;
  onPageChange: (currentPage: number) => void;
}

const itemRender = (current, type, element) => {
  if (type === 'prev') {
    return (
      <Flex w="30px" h="30px" justifyContent="center" alignItems="center" mr="10px" bg="#F2F9FC" borderRadius="md" cursor="pointer">
        <ChevronLeftIcon />
      </Flex>
    );
  }
  if (type === 'next') {
    return (
      <Flex w="30px" h="30px" justifyContent="center" alignItems="center" ml="10px" bg="#F2F9FC" borderRadius="md" cursor="pointer">
        <ChevronRightIcon />
      </Flex>
    );
  }
  return element;
};

const SimplePagination = (paginationState: PaginationProps) => {
  return (
    <Flex
      mt="20px"
      mr="20px"
      justifyContent="flex-end"
      sx={{
        '.rc-pagination-simple': {
          display: 'flex',
          listStyle: 'none'
        },
        '.rc-pagination-simple-pager >input': {
          width: '30px',
          height: '30px',
          bg: 'boxBackground',
          color: 'primary',
          borderRadius: 'md',
          lineHeight: '30px',
          textAlign: 'center',
          outline: 'none'
        },
        '.rc-pagination-simple-pager > span': {
          marginLeft: '10px',
          marginRight: '10px'
        }
      }}
    >
      <Pagination
        simple
        total={paginationState.total}
        pageSize={paginationState.limit}
        current={paginationState.page}
        itemRender={itemRender}
        onChange={(currentPage) => {
          if (currentPage) {
            paginationState?.onPageChange?.(currentPage);
          }
        }}
      />
    </Flex>
  );
};

export default SimplePagination;
