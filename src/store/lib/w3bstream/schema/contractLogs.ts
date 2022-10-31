import { ContractLogType } from '@/server/routers/w3bstream';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';

export class ContractLogsSchema {
  table = new JSONSchemaTableState<ContractLogType>({
    columns: [
      {
        key: 'f_contractlog_id',
        label: 'Contract Log ID'
      },
      {
        key: 'f_project_name',
        label: 'Project Name'
      },
      {
        key: 'f_event_type',
        label: 'Event Type'
      },
      {
        key: 'f_chainid',
        label: 'Chain ID'
      },
      {
        key: 'f_contractaddress',
        label: 'Contract Address'
      },
      {
        key: 'f_blockstart',
        label: 'Block Start'
      },
      {
        key: 'f_blockcurrent',
        label: 'Block Current'
      },
      {
        key: 'f_blockend',
        label: 'Block End'
      },
      {
        key: 'f_topic0',
        label: 'Topic0'
      },
      {
        key: 'f_updated_at',
        label: 'Updated At'
      }
    ],
    rowKey: 'f_contractlog_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 160px)' }
  });

  constructor(args: Partial<JSONSchemaTableState<ContractLogType>> = {}) {
    Object.assign(this, args);
  }
}
