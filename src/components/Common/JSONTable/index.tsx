import { observer } from 'mobx-react-lite';
import { Table } from '@mantine/core';

export const JSONTable = observer(({ data }: { data: Array<object> }) => {
  return (
    <Table >
      <thead>
        <tr>
          {Object.keys(data[0]).map((key) => {
            return <th>{key}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          return (
            <tr key={index}>
              {Object.keys(item).map((key, index) => {
                return <td key={index}>{item[key]}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
});
