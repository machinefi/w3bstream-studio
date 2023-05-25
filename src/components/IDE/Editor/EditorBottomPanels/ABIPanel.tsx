import React, { useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box } from '@chakra-ui/layout';
import {
  Flex,
  Text,
  Icon,
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Link,
  Card,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Accordion,
  VStack,
  Button,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  FormLabel,
  AccordionIcon,
  FormControl,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Alert,
  AlertIcon,
  AlertDescription,
  Checkbox
} from '@chakra-ui/react';
import { MinusIcon, LinkIcon, RepeatIcon, CopyIcon } from '@chakra-ui/icons';
import { toJS } from 'mobx';
import { helper, toast } from '@/lib/helper';
import { ContractInstance, FunctionState } from '@/store/lib/ContractInstance';
import { BooleanState } from '@/store/standard/base';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Copy } from '@/components/Common/Copy';

export const ABIPanel = observer(() => {
  const {
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  const store = useLocalObservable<{ curContractInstance: ContractInstance }>(() => ({
    curContractInstance: null
  }));

  useEffect(() => {
    if (curFilesListSchema.curActiveFile.data.dataType == 'abi') {
      const codeJSON = helper.json.safeParse(curFilesListSchema.curActiveFile.data.code);
      let abi;
      if (Array.isArray(codeJSON)) {
        abi = codeJSON;
      } else if (codeJSON.abi) {
        abi = codeJSON.abi;
      }
      store.curContractInstance = new ContractInstance({
        abi,
        name: curFilesListSchema.curActiveFile.label,
        address: codeJSON.address ?? ''
      });
    }
  }, [curFilesListSchema.curActiveFile, curFilesListSchema.curActiveFile.data.code]);

  return (
    <>
      <Flex color="white"  height="calc(100%)" overflowY={'scroll'} w="100%">
        <Box position="relative" w="100%">
          <Card bg="none" borderRadius={0} w="100%">
            <Box overflow="auto" h="100%" w="100%">
              <InputGroup size={'sm'}>
                <InputLeftAddon children="Name" />
                <Input readOnly placeholder="please input the address" value={store.curContractInstance?.name} />
              </InputGroup>
              <InputGroup size={'sm'} my="4px">
                <InputLeftAddon children="Address" />
                <Input
                  onChange={(e) => {
                    store.curContractInstance.address = e.target.value;
                    console.log(store.curContractInstance.address);
                  }}
                  placeholder="please input the address"
                  value={store.curContractInstance?.address}
                />
                <InputRightAddon
                  children={
                    <Link href={``} target="__blank">
                      <LinkIcon />
                    </Link>
                  }
                />
              </InputGroup>
              <FunctionList contract={store.curContractInstance} />
            </Box>
          </Card>
        </Box>
      </Flex>
    </>
  );
});

export const FunctionList = observer(({ contract }: { contract: ContractInstance }) => {
  const { god } = useStore();
  const {
    w3s: {
      projectManager: { curFilesListSchema }
    }
  } = useStore();

  return (
    <Tabs size="sm" isLazy onChange={(i) => contract.setTabIndex(i)} index={contract?.tabIndex}>
      <TabList>
        <Tab>Read</Tab>
        <Tab>Write</Tab>
        <Tab>Event</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Accordion allowMultiple>
            {contract?.readFunctions.map((functionItem) => (
              <FunctiomItem functionItem={functionItem} contract={contract} key={functionItem.name} />
            ))}
          </Accordion>
        </TabPanel>
        <TabPanel>
          <Accordion allowMultiple>
            {contract?.writeFunction.map((functionItem) => (
              <FunctiomItem functionItem={functionItem} contract={contract} key={functionItem.name} />
            ))}
          </Accordion>
        </TabPanel>
        <TabPanel>
          <Accordion allowMultiple>
            {contract?.events.map((functionItem) => (
              <EventItem functionItem={functionItem} contract={contract} key={functionItem.name} />
            ))}
          </Accordion>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
});

export const FunctiomItem = observer(({ functionItem, contract }: { functionItem: FunctionState; contract: ContractInstance }) => {
  const { god, lang: {t} } = useStore();
  const _contract = contract;
  const store = useLocalObservable(() => ({
    loading: new BooleanState(),
    async onCall(func: FunctionState, address) {
      console.log(contract);
      if (!address) {
        return toast.warning('Please set address');
      }
      func.setCallError('');
      const options = {} as any;
      if (func.amount?.value) {
        options.value = func.amount.value;
      }
      if (func.gasLimit) {
        options.gasLimit = func.gasLimit;
      }

      store.loading.setValue(true);
      const params = func.inputs.map((i) => {
        i = helper.json.safeParse(i.value);
        if (typeof i == 'number') {
          return new BigNumber(i).toFixed();
        }
        return i;
      });
      console.log(params);

      const [err, res] = await helper.promise.runAsync(
        god.currentNetwork.execContract({
          address,
          abi: contract.abi,
          method: func.name,
          params,
          options
        })
      );

      if (!err) {
        if (res.hash) {
          func.setCallResult(res.hash);
          // @ts-ignore
          // store.curContractInstance.addExecHistory({ method: functionItem.name, params, options, address: store.curContractInstance.address, hash: res.hash });
          res.wait();
        } else {
          func.setCallResult(res.toString());
        }
      }
      store.loading.setValue(false);
      if (err) {
        console.log(err);
        functionItem.setCallError(err.message);
      }
    },
    async copyByteCode(func: FunctionState) {
      try {
        const params = func.inputs.map((i) => {
          i = helper.json.safeParse(i.value);
          if (typeof i == 'number') {
            return new BigNumber(i).toFixed();
          }
          return i;
        });
        const abi = contract.abi;
        const Interface = new ethers.utils.Interface(abi);
        const bytecode = Interface.encodeFunctionData(functionItem.name, params);
        await navigator.clipboard.writeText(bytecode);
        toast.success(t("success.copy.msg"));
      } catch (e) {
        toast.error(e.message);
      }
    }
  }));
  return (
    <AccordionItem key={functionItem.name}>
      <AccordionButton color={functionItem.background} py={1.5} px={0}>
        <Box flex="1" textAlign="left" fontSize="sm" fontWeight={500}>
          {functionItem.name}（{functionItem.inputs?.length || 0}）
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel py={2} px={2}>
        {functionItem.inputs?.length ? (
          <Box>
            {functionItem.inputs.map((input) => (
              <FormControl key={input.name}>
                <FormLabel fontSize="xs" mb={0.5}>
                  {input.name}
                </FormLabel>
                <Input size="xs" mb={1.5} fontSize="sm" value={input.value} onChange={(e) => input.setValue(e.target.value)} placeholder={input.type} />
              </FormControl>
            ))}
          </Box>
        ) : null}
        <Flex mt="8px" alignItems="center">
          <Button isDisabled={contract.address == ''} onClick={(e) => store.onCall(functionItem, contract.address)} size="sm" isLoading={store.loading.value}>
            Submit
          </Button>
          <Button ml={2} onClick={(e) => store.copyByteCode(functionItem)} size="sm">
            Copy bytecode
          </Button>

          {['payable', 'nonpayable'].includes(functionItem.stateMutability) && (
            <Checkbox size="sm" isChecked={functionItem.showCustom} ml={4} onChange={(e) => functionItem.setShowCustom(e.target.checked)}>
              Custom
            </Checkbox>
          )}
        </Flex>
        {functionItem.showCustom && (
          <FormControl mt="8px">
            <FormLabel fontSize="xs" mb={0.5}>
              GAS LIMIT
            </FormLabel>
            <NumberInput defaultValue={3000000} onChange={(e) => functionItem.setGasLimit(e)} size="xs" min={0} mb={1.5}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {functionItem.amount && (
              <Box>
                <FormLabel fontSize="xs" mb={0.5}>
                  VALUE
                </FormLabel>
                <InputGroup size="xs">
                  <Input defaultValue={0} mb={1.5} value={functionItem.amount.input} onChange={(e) => functionItem.amount.setInput(e.target.value)} placeholder={'please enter amount'} />
                  <InputRightAddon>
                    <Select size="xs" value={functionItem.amount.unit} onChange={(e) => functionItem.amount.setUnit(e.target.value)} border="none">
                      {Object.keys(functionItem.amount.unitConfig).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </Select>
                  </InputRightAddon>
                </InputGroup>
              </Box>
            )}
          </FormControl>
        )}
        {functionItem.callError && (
          <Alert status="error" mt={2}>
            <AlertIcon />
            <AlertDescription fontSize="sm">{functionItem.callError}</AlertDescription>
          </Alert>
        )}
      </AccordionPanel>
      {functionItem.callResult && <CallResult text={functionItem.callResult} />}
    </AccordionItem>
  );
});

export const EventItem = observer(({ functionItem, contract }: { functionItem: FunctionState; contract: ContractInstance }) => {
  const { god } = useStore();
  const _contract = contract;
  const store = useLocalObservable(() => ({
    loading: new BooleanState(),
    async onCall(func: FunctionState, address) {
      console.log(contract);
      if (!address) {
        return toast.warning('Please set address');
      }
      func.setCallError('');
      const options = {} as any;
      if (func.amount?.value) {
        options.value = func.amount.value;
      }
      if (func.gasLimit) {
        options.gasLimit = func.gasLimit;
      }

      store.loading.setValue(true);
      const params = func.inputs.map((i) => {
        i = helper.json.safeParse(i.value);
        if (typeof i == 'number') {
          return new BigNumber(i).toFixed();
        }
        return i;
      });
      console.log(params);

      const [err, res] = await helper.promise.runAsync(
        god.currentNetwork.execContract({
          address,
          abi: contract.abi,
          method: func.name,
          params,
          options
        })
      );

      if (!err) {
        if (res.hash) {
          func.setCallResult(res.hash);
          // @ts-ignore
          // store.curContractInstance.addExecHistory({ method: functionItem.name, params, options, address: store.curContractInstance.address, hash: res.hash });
          res.wait();
        } else {
          func.setCallResult(res.toString());
        }
      }
      store.loading.setValue(false);
      if (err) {
        console.log(err);
        functionItem.setCallError(err.message);
      }
    },
    async copyTopic(func: FunctionState) {
      try {
        let transferEventSignature// = 'Transfer(address,address,uint256)';
        transferEventSignature = `${func.name}(${func.inputs.map((i) => i.type).join(',')})`
        const topic = ethers.utils.id(transferEventSignature);
        await navigator.clipboard.writeText(topic);
        toast.success('Copy Success');
      } catch (e) {
        toast.error(e.message);
      }
    }
  }));
  return (
    <AccordionItem key={functionItem.name}>
      <AccordionButton color={functionItem.background} py={1.5} px={0}>
        <Box flex="1" textAlign="left" fontSize="sm" fontWeight={500}>
          {functionItem.name}（{functionItem.inputs?.length || 0}）
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel py={2} px={2}>
        {functionItem.inputs?.length ? (
          <Box>
            {functionItem.inputs.map((input) => (
              <FormControl key={input.name}>
                <FormLabel fontSize="xs" mb={0.5}>
                  {input.name}
                </FormLabel>
                <Input size="xs" mb={1.5} fontSize="sm" value={input.value} onChange={(e) => input.setValue(e.target.value)} placeholder={input.type} />
              </FormControl>
            ))}
          </Box>
        ) : null}
        <Flex mt="8px" alignItems="center">
          <Button ml={2} onClick={(e) => store.copyTopic(functionItem)} size="sm">
            Copy Topic0
          </Button>
        </Flex>
      </AccordionPanel>
      {functionItem.callResult && <CallResult text={functionItem.callResult} />}
    </AccordionItem>
  );
});

export const CallResult = observer(({ text }: { text: string }) => {
  const { god } = useStore();
  let detail = <Text>{text}</Text>;
  if (text.startsWith('0x')) {
    const route = text.length == 42 ? 'address' : 'tx';
    detail = (
      <>
        <Link color="twitter.500" href={`${god.currentChain.explorerURL}/${route}/${text}`} target="__blank">
          {text}
        </Link>
        <Copy value={text}></Copy>
      </>
    );
  }

  return (
    <Box fontSize="xs" ml={2} pb={2}>
      {detail}
    </Box>
  );
});
