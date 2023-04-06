import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Text, Flex, chakra, FlexProps } from '@chakra-ui/react';

type Options = {
  tags: string[];
  flexProps?: FlexProps;
};

export interface SelectTagWidgetProps extends WidgetProps {
  options: Options;
}

export interface SelectTagWidgetUIOptions {
  'ui:widget': (props: SelectTagWidgetProps) => JSX.Element;
  'ui:options': Options;
}

function SelectTagWidget({ id, options, value, required, label, onChange }: SelectTagWidgetProps) {
  const [selectedTags, setSelectedTags] = useState([]);
  const { tags = [], flexProps = {} } = options;
  useEffect(() => {
    onChange(selectedTags.join(','));
  }, [selectedTags]);

  return (
    <>
      <Flex alignItems="center">
        <Text>{label}</Text>
        {required && (
          <chakra.span ml="0.25rem" color="#D34B46">
            *
          </chakra.span>
        )}
      </Flex>
      <Flex mt="10px" id={id} flexWrap="wrap" {...flexProps}>
        {tags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <Flex
              key={tag}
              mb="5px"
              mr="5px"
              p="5px 10px"
              alignItems="center"
              color={selected ? '#946FFF' : '#000'}
              border={selected ? '1px solid #946FFF' : '1px solid #EDEDED'}
              borderRadius="6px"
              cursor="pointer"
              onClick={() => {
                const index = selectedTags.findIndex((selectedTag) => selectedTag === tag);
                if (index === -1) {
                  setSelectedTags([...selectedTags, tag]);
                } else {
                  setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
                }
              }}
            >
              <Text>{tag}</Text>
            </Flex>
          );
        })}
      </Flex>
    </>
  );
}

export default SelectTagWidget;
