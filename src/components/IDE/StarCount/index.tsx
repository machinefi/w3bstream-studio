import { chakra, Icon, Link } from '@chakra-ui/react';
import React from 'react';
import { AiOutlineStar } from 'react-icons/ai';
import { TbMinusVertical } from 'react-icons/tb';

const StarCount = () => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    fetch('https://api.github.com/repos/machinefi/w3bstream')
      .then((res) => res.json())
      .then((data) => {
        setCount(data.stargazers_count);
      });
  }, []);
  return (
    <Link display="flex" mx="20px" alignItems="center" p="12px 14px" bg="#F3F3F3" borderRadius="60px" href="https://github.com/machinefi/w3bstream" isExternal>
      <Icon as={AiOutlineStar} />
      <chakra.span ml="10px" fontSize="12px" fontWeight={400}>
        Star
      </chakra.span>
      <Icon mx="8px" color={"gray"} as={TbMinusVertical} />
      <chakra.span fontSize="12px" fontWeight={400}>
        {count}
      </chakra.span>
    </Link>
  );
};

export default StarCount;
