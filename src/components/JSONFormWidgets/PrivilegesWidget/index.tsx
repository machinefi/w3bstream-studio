import React, { useEffect } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Flex, Input, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Select, Menu, MenuButton, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { useStore } from '@/store/index';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useLocalObservable } from 'mobx-react-lite';

type Options = {
  Privileges: string;
};

export interface PrivilegesWidgetProps extends WidgetProps {
  options: Options;
}

const PrivilegesWidget = ({ id, label, required, value, readonly, onChange, options = { Privileges: '' } }: PrivilegesWidgetProps) => {
  const { Privileges } = options;
  const {
    w3s: { apiKeys }
  } = useStore();
  const store = useLocalObservable(() => ({
    selectperm(perm: string, index: number) {
      let priv = apiKeys.privileges;
      priv[index].perm = perm;
      apiKeys.set({
        privileges: priv
      });
      console.log(apiKeys.privileges);
      onChange(JSON.stringify(apiKeys.privileges));
    }
  }));

  useEffect(() => {
    if (apiKeys.privileges.length == 0) {
      apiKeys.privileges = apiKeys.operatorGrounpMetas?.value?.map((i) => {
        return {
          name: i.name,
          perm: 'NO_ACCESS'
        };
      });
    }
  }, []);
  const { t } = useTranslation();
  return (
    <Accordion mt={2} border="none" allowMultiple>
      <AccordionItem border="none">
        <AccordionButton border={'1px solid #e1e8f0'} borderRadius={'4px'} display={'flex'}>
          <Flex direction="column">
            <Text fontSize="14px" textAlign={'left'}>
              Account permissions
            </Text>
            <Text fontSize="12px" textAlign={'left'} color="#7a7a7a">
              User permissions permit access to resources under your w3bstream account.
            </Text>
          </Flex>
          <AccordionIcon ml="auto" />
        </AccordionButton>
        <AccordionPanel pb={4} border={'1px solid #e1e8f0'}>
          {apiKeys.operatorGrounpMetas?.value?.map((i, index) => {
            return (
              <Flex mb={2} borderBottom={'1px solid #e1e8f0'} alignItems={'center'}>
                <Flex direction={'column'}>
                  <Text fontSize="14px" textAlign={'left'}>
                    {i.name}
                  </Text>
                  <Text fontSize="12px" color="#7a7a7a">
                    {i.desc}
                  </Text>
                </Flex>

                <Menu>
                  <MenuButton ml="auto" size="xs" as={Button} rightIcon={<ChevronDownIcon />}>
                    Access:{apiKeys.privileges?.[index]?.perm ?? 'No access'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => store.selectperm('NO_ACCESS', index)}>No access</MenuItem>
                    <MenuItem onClick={() => store.selectperm('READONLY', index)}>Read-only</MenuItem>
                    <MenuItem onClick={() => store.selectperm('READ_WRITE', index)}>Read and write</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            );
          })}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default PrivilegesWidget;
