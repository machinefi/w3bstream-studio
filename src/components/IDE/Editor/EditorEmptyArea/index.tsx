import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Button, Flex } from '@chakra-ui/react';
import { helper } from '@/lib/helper';
import toast from 'react-hot-toast';
import { hooks } from '@/lib/hooks';
import { defaultOutlineButtonStyle } from '@/lib/theme';

export const EditorEmptyArea = observer(() => {
  const {
    w3s: { projectManager }
  } = useStore();
  return (
    <Flex justify={'center'} align="center" direction="column" w="full">
      <Flex justify={'center'} mt={12}>
        No File Selected!
      </Flex>
      <Button
        mt={4}
        w="50%"
        {...defaultOutlineButtonStyle}
        onClick={async () => {
          const formData = await hooks.getFormData({
            title: 'Create a File',
            size: '2xl',
            formList: [
              {
                form: projectManager.initWasmTemplateForm
              }
            ]
          });
          if (!formData.template) {
            return toast.error('Please select a template!');
          }
          const template = helper.json.safeParse(formData.template) ?? null;
          if (template && !template?.label?.startsWith('.')) {
            const [firstWord, ...rest] = template.label.split('.');
            const newFileName = `${firstWord}_${helper.string.random(4)}.${rest.join('.')}`;
            template.label = newFileName;
          }
          projectManager.curFilesListSchema.createFileFormFolder(projectManager.curFilesList[0], 'file', template);
        }}
      >
        New File
      </Button>
    </Flex>
  );
});
