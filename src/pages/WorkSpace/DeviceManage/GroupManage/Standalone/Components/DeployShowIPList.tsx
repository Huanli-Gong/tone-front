
import React, { forwardRef } from 'react';
import { Tag, } from 'antd'

/**
 * 部署Agent对话框：表单受控组件。
 */ 
export default forwardRef((props: any, ref: any) => {
  // console.log('data:', data)
  const { value, onChange, dataSource=[], delCallback } = props || {}
  
  // 删除
  function preventDefault(e: any, id: any) {
    e.preventDefault();
    if (dataSource && Array.isArray(dataSource)) {
      const temp = dataSource.filter((item: any) => item.id !== id )
      const ids = temp.map((item: any) => item.id)
      onChange(ids)
      delCallback(temp)
    }
  }

	return (
      <div ref={ref}>
        {dataSource.map((item: any)=>
          <Tag closable={!(dataSource && dataSource.length === 1)}
            onClose={(e)=> preventDefault(e, item.id)} key={item.id}>{item.ip}</Tag> )}
      </div>
	);
});