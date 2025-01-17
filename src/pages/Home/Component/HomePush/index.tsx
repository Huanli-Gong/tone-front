import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { Button, Modal, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { First, Second, Third, Fourth } from './components';
import styles from './index.less';
import { useClientSize } from '@/utils/hooks';

/**
 * tone首页
 */
export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [openInitial, setOpenInitial] = useState(false);
  const carouselRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    show: ({ initial }: any) => {
      setVisible(true);
      setOpenInitial(initial)
    }
  }))
  useEffect(() => {
    carouselRef?.current?.goTo(current);
  }, [visible])

  const handleOk = () => {
    setVisible(false);
    setCurrent(0);
  };
  const handleCancel = () => {
    setVisible(false);
    setCurrent(0);
  };

  const prevClick = () => {
    if (current !== 0) {
      carouselRef?.current?.prev();
      setCurrent(current - 1)
    }
  }
  const nextClick = () => {
    if (current !== 3) {
      carouselRef?.current?.next();
      setCurrent(current + 1)
    }
  }

  const client = useClientSize()
  const windowSize = { width: client.width - 60 , height : client.height - 60 }

  const calcSize = (()=> {
    const maxSize = { width: 1340, height: 704 }
    return windowSize?.width > maxSize.width ? maxSize: windowSize
  })()

  return (
      <Modal className={styles.HomePush_root}
        centered
        title={null}
        open={visible}
        maskClosable={false}
        closeIcon={openInitial ? <span className={styles.close_btn_text}>{current == 3 ? '进入T-One' : '跳过'}</span> : null}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={calcSize?.width}
        destroyOnClose={true}
        bodyStyle={{ padding: 0, height: calcSize?.height, width: calcSize?.width, overflow: (calcSize?.width === 1340 ? 'hidden': 'auto') }}
      >
        <div className={styles.scroll_wrap}>
          <Carousel ref={carouselRef}
            autoplay={visible && current !== 3}
            afterChange={(curr) => { setCurrent(curr) }}
            dots={{
              className: 'dotsClass',
            }}
          >
            <div className={styles.banner_item}>
              <First />
            </div>
            <div className={styles.banner_item}>
              <Second />
            </div>
            <div className={styles.banner_item}>
              <Third />
            </div>
            <div className={styles.banner_item}>
              <Fourth />
            </div>
          </Carousel>
          <LeftOutlined className={styles.prev} style={current == 0 ? { opacity: 0.05 } : {}} onClick={prevClick} />
          <RightOutlined className={styles.next} style={current == 3 ? { opacity: 0.05 } : {}} onClick={nextClick} />
        </div>
      </Modal>
  )
})
