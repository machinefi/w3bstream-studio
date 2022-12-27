import { Box, Flex, Stack, Input, Button } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

export const ProjectEnvs = observer(() => {
  const {
    w3s: {
      project,
      project: { envs }
    }
  } = useStore();

  return (
    <Stack>
      <Box>Project Environment Variables</Box>
      {envs.map((item) => (
        <Flex w="100%" key={item.id}>
          <Input
            w="300px"
            placeholder="Key"
            size="md"
            value={item.key}
            onChange={(e) => {
              project.onChangeEnv(item.id, e.target.value, item.value);
            }}
          />
          <Input
            ml="10px"
            w="100%"
            placeholder="Value"
            size="md"
            value={item.value}
            onChange={(e) => {
              project.onChangeEnv(item.id, item.key, e.target.value);
            }}
          />
          <Button
            ml="10px"
            variant="outline"
            onClick={() => {
              project.onDeleteEnv(item.id);
            }}
          >
            <DeleteIcon />
          </Button>
        </Flex>
      ))}

      <Flex justifyContent="flex-end">
        <Button
          variant="outline"
          fontWeight={400}
          onClick={() => {
            project.onAddEnv();
          }}
        >
          Add Environment Variable
        </Button>
        <Button
          ml="10px"
          fontWeight={400}
          onClick={() => {
            project.onSaveEnv();
          }}
        >
          Save Changes
        </Button>
      </Flex>
    </Stack>
  );
});

export const ProjectEnvsWidget = () => {
  return <ProjectEnvs />;
};
