import { observer } from 'mobx-react-lite';
import React from 'react';
import { ConfirmModal} from '@/components/Confirm';
import { useStore } from '@/store/index'

export const GlobalProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { base: { confirm } } = useStore()
  return (
    <>
      {children}
      <ConfirmModal {...confirm.confirmProps} openState={confirm}/>
    </>
  );
})
