import { useClientSize } from '@/utils/hooks';
import React from 'react';

export default function ContentContainer(props: any) {
  const { height: layoutHeight } = useClientSize()

  return (
    <div style={{ minHeight: layoutHeight - 50, background: '#fff' }}>
      {props.children}
    </div>
  )
}