/* eslint-disable @typescript-eslint/no-unused-expressions */
import { forwardRef, useState } from 'react'
import { Button, message, Upload, Modal } from 'antd'
import { FormattedMessage, useIntl } from 'umi';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './BizUpload.less';

const { confirm } = Modal;

// 文件上传组件
const BizUpload = forwardRef((props, ref) => {
  const { formatMessage } = useIntl();
  // 状态
  const [fileList, setFileList] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  // 文件上传限制

  const beforeUpload = (file: any) => {
    const { type, size } = file
    // 限制文件类型
    const validType = ['application/x-tar'];
    const isValidType = validType.indexOf(type) >= 0;
    if (!isValidType) {
      message.error(formatMessage({ id: 'upload.list.Drawer.valid.type' }));
      return false
    }
    // 限制大小500M文件
    const validFileSize = size / 1024 / 1024 <= 500
    if (!validFileSize) {
      confirm({
        title: formatMessage({ id: 'upload.list.Drawer.confirm.title' }),
        content: formatMessage({ id: 'upload.list.Drawer.confirm.content' }),
        cancelText: formatMessage({ id: 'operation.cancel' }),
        okText: formatMessage({ id: 'operation.confirm' }),
        icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      })
      return false
    }
    // getUploadTar({ file })
    return true
  }
  const onChange = (info: any) => {
    if (info.file.status === 'uploading') {
      !loading && setLoading(true)
    }
    if (info.file.status === 'done') {

      // console.log('info-----done:', info);
      // 处理响应数据
      const { response = {}, ...params } = info.file;
      const { code, link, path } = response;
      // 上传成功
      if (code === 200) {
        setFileList([
          {
            ...params,
            url: link,
            link,
            path,
          }
        ]);
        // 应后端要求：文件上传成功后延迟两秒后才能提交。
        const timer = setTimeout(() => {
          setLoading(false)
          /* @ts-ignore */
          props.onChange([{ link, path }]);
          // console.log('timer--dy:', timer)
          clearTimeout(timer);
        }, 2000)
      } else {
        setLoading(false)
      }
    } else if (info.file.status === 'error') {
      setLoading(false)
      message.error('上传数据失败');
    }
  }
  const progress = {
    strokeColor: {
      '0%': '#1890ff',
      '100%': '#1890ff',
    },
    strokeWidth: 3,
    format: (percent: any) => <span style={{ color: '#1890ff' }}>{`${parseFloat(percent.toFixed(2))}%`}</span>,
  }

  const handleRemove = (file: any) => {
    // 如果上传中途点击了删除按钮。
    setLoading(false)
    const list = fileList.filter((item: any) => item.uid !== file.uid)
    setFileList(list);
    if (list.length) {
      /* @ts-ignore */
      props.onChange(list);
    } else {
      /* @ts-ignore */
      props.onChange(undefined);
    }
  }

  return (
    /* @ts-ignore */
    <div ref={ref} className={styles.BizUpload_root}>
      <Upload className={styles[`${loading ? 'BizUpload_loading' : 'BizUpload'}`]}
        name="file"
        action={'/api/job/test/upload/tar/'}
        beforeUpload={beforeUpload}
        onChange={onChange}
        progress={progress}
        // fileList={fileList}
        onRemove={handleRemove}>
        {!loading &&
          <Button icon={<UploadOutlined style={{ marginRight: 10 }} />} loading={loading} disabled={!!fileList.length}>
            <FormattedMessage id="upload.list.Drawer.upload.button" />
          </Button>
        }
      </Upload>
    </div>
  )
});

export default BizUpload;