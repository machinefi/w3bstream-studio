import { JSONSchemaRenderData } from '@/components/JSONRender';
import { IconType } from 'react-icons/lib';

type INodeGroup = 'trigger' | 'code' | 'condition' | 'runtime' |'common';
type INodeNodeType = 'code' | 'webhook' | 'cron' | 'form' | 'simulation' | 'runtime';
type INodeIconType = string | IconType | React.ReactNode;
type IFormType = {
  title: string;
  size: string;
  autoSubmission?: boolean;
  formList: {
    label?: string;
    form: JSONSchemaRenderData[];
  }[];
};
interface INodeTypeDescription {
  displayName: string;
  /**name is the name attribute corresponds to the class of this code  */
  name: string;
  // nodeType: INodeNodeType;
  group: INodeGroup;
  groupIcon?: INodeIconType;
  /**icon: if icon is string must url: /icons/icon_nft.png */
  icon: INodeIconType;
  withTargetHandle: boolean;
  withSourceHandle: boolean;
  withVariableHandle?: string[];
  version?: string;
  description?: string;
  isVariableNode?: boolean;
}

interface INodeType {
  uuid: string;
  description: INodeTypeDescription;
  form: IFormType;
  toJSON?: () => Object;
}

export type { INodeTypeDescription, INodeType, INodeGroup, INodeIconType, IFormType };
