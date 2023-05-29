import { useEffect } from 'react';
import { Box, Flex, Stack, Input, Button,Text } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { v4 as uuidv4 } from 'uuid';
import { axios } from '@/lib/axios';
import { WidgetProps } from '@rjsf/utils';
import { eventBus } from '@/lib/event';
import toast from 'react-hot-toast';

interface Env {
  id: string;
  key: string;
  value: string;
}

type Options = {};

export interface ProjectEnvsWidgetProps extends WidgetProps {
  options: Options;
}

export type ProjectEnvsWidgetUIOptions = {
  'ui:widget': (props: ProjectEnvsWidgetProps) => JSX.Element;
  'ui:options': Options;
};

export const ProjectEnvs = observer(() => {
  const {
    w3s: {
      project,
      project: { curProject, formMode },
      config: {
        form: {
          formData: { accountRole }
        }
      }
    }
  } = useStore();
  const envs = curProject?.envs?.env;
  const store = useLocalObservable(() => ({
    envs: [],
    setData(
      v: Partial<{
        envs: Env[];
      }>
    ) {
      Object.assign(store, v);
    },
    onAddEnv() {
      store.envs.push({
        id: uuidv4(),
        key: '',
        value: ''
      });
    },
    onDeleteEnv(id: string) {
      store.envs = store.envs.filter((i) => i.id !== id);
    },
    onChangeEnv(id: string, key: string, value: string) {
      for (let i = 0; i < store.envs.length; i++) {
        const item = store.envs[i];
        if (item.id === id) {
          item.key = key;
          item.value = value;
          break;
        }
      }
    },
    async onSaveEnv() {
      const values = store.envs.filter((item) => !!item.key).map((item) => [item.key, item.value]);
      if (values.length) {
        const projectName = accountRole === 'DEVELOPER' ? curProject?.name : project.form.value.get().name;
        if (projectName) {
          try {
            await axios.post(`/api/w3bapp/project_config/x/${projectName}/PROJECT_ENV`, { env: values });
            toast.success('Save environment variables successfully');
            eventBus.emit('project.update');
          } catch (error) {
            throw error;
          }
        } else {
          toast.error('Project name is empty');
        }
      }
    }
  }));

  useEffect(() => {
    if (formMode === 'edit') {
      if (envs) {
        store.setData({
          envs: envs.map((item) => {
            return {
              id: uuidv4(),
              key: item[0],
              value: item[1]
            };
          })
        });
      } else {
        store.onAddEnv();
      }
    } else {
      store.onAddEnv();
    }
  }, [envs, formMode]);

  return (
    <Stack>
      <Text fontSize="16px" fontWeight={600}>
        Environment Variables
      </Text>

      <Text fontSize="14px" color="#7a7a7a">
        Use environment variables to store API keys and other configuration values and secrets. You can access them in your code like regular environment variables
      </Text>
      <Box  pt="20px" >
      {store.envs.map((item) => (
        <Flex w="100%" key={item.id}>
          <Input
            w="300px"
            placeholder="Key"
            size="md"
            fontSize={"14px"}
            value={item.key}
            onChange={(e) => {
              store.onChangeEnv(item.id, e.target.value, item.value);
            }}
          />
          <Input
            ml="10px"
            w="100%"
            placeholder="Value"
            size="md"
            fontSize={"14px"}
            value={item.value}
            onChange={(e) => {
              store.onChangeEnv(item.id, item.key, e.target.value);
            }}
          />
          <Button
            ml="10px"
            variant="outline"
            onClick={() => {
              store.onDeleteEnv(item.id);
            }}
          >
            <DeleteIcon />
          </Button>
        </Flex>
      ))}
      </Box>

      <Flex justifyContent="flex-end">
        <Button
          size="sm"
          variant="outline"
          fontWeight={400}
          {...defaultOutlineButtonStyle}
          onClick={() => {
            store.onAddEnv();
          }}
        >
          <Text>Add Environment Variable</Text>
        </Button>
        {formMode === 'edit' && (
          <Button
            ml="10px"
            size="sm"
            fontWeight={400}
            {...defaultButtonStyle}
            onClick={() => {
              store.onSaveEnv();
            }}
          >
            Save Changes
          </Button>
        )}
      </Flex>
    </Stack>
  );
});

export const ProjectEnvsWidget = (props: ProjectEnvsWidgetProps) => {
  return <ProjectEnvs {...props} />;
};
