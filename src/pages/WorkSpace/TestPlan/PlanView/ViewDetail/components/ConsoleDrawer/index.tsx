import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Form, Button, message, Row } from 'antd'
import { CloseOutlined } from '@ant-design/icons';
import { FormattedMessage  } from 'umi';
import CodeEditer from '@/components/CodeEditer';
import styles from './index.less';

// console
const DrawerForm = forwardRef((props, ref) => {
  //
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<any>({})
  useImperativeHandle(
    ref,
    () => ({
        show: (title= '', propsData) => {
            // console.log('propsData',propsData);
            setVisible(true);
            setCurrent({ config_value: propsData });
        }
    })
  )

  // 取消
  const handleClose = () => {
    setVisible(false)
  }

  return (
    <div className={styles.ConsoleDrawer}>
      <Drawer
        maskStyle={{ opacity: 0, animation: 'unset' }}
        maskClosable={ true }
        keyboard={ false }
        onClose={handleClose}
        visible={visible}
        placement="bottom"
        closeIcon={<CloseOutlined style={{ color: '#fff' }}  />}
        closable={true}
        bodyStyle={{ padding: 0 }}
        footer={null}>
          <div className={styles.ConsoleDrawer_content}>
            <CodeEditer
                code={current.config_value}
                onChange={(value: any) => setCurrent({
                    ...current,
                    config_value: value,
                })}
                readOnly="nocursor"
            />
          </div>
      </Drawer>
    </div>
  )
});

export default DrawerForm;
