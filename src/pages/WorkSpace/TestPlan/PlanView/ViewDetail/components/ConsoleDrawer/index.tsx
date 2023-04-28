import { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer } from 'antd'
import { CloseOutlined } from '@ant-design/icons';
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      show: (title = '', propsData: any) => {
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
        maskClosable={true}
        keyboard={false}
        onClose={handleClose}
        visible={visible}
        placement="bottom"
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
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
