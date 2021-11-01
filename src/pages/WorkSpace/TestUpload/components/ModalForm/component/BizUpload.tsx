import React, { forwardRef, useState } from 'react'
import { Button, message, Upload, Modal } from 'antd'
import { FormattedMessage, useIntl } from 'umi';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
const { confirm } = Modal;

// 文件上传组件
const BizUpload = forwardRef((props, ref) => {
  const { formatMessage } = useIntl();
  // 状态
  const [fileList, setFileList] = useState([]);
  // useState(([value]).map(item => ({
  //   url: item,
  //   name: '',
  //   success: true,
  // })));

  // 文件上传限制
  const beforeUpload =(file: any) => {
    const { type, size } = file
    // 限制文件类型
    const validType = ['application/x-tar'];
    const isValidType = validType.indexOf(type) >= 0;
    if (!isValidType) {
      message.error(formatMessage({id: 'upload.list.Drawer.valid.type'}));
      return false
    }
    // 限制文件大小
    const validFileSize = size / 1024 / 1024 <= 500
    if (!validFileSize) {
      confirm({
        title: formatMessage({id: 'upload.list.Drawer.confirm.title'}),
        content: formatMessage({id: 'upload.list.Drawer.confirm.content'}),
        cancelText: formatMessage({id: 'Drawer.btn.close'}),
        okText: formatMessage({id: 'Drawer.btn.confirm'}),
        icon: <CloseCircleOutlined style={{ color: '#f5222d' }}/>,
      })
      return false
    }

    setFileList([file]);
    props.onChange(file);
    props.callback(file);
    return false
  }

  // 删除
  const handleRemove =(file: any) => {
    const list = fileList.filter(item => item.url !== file.url)
    setFileList(list);
    if (list.length) {
      props.onChange(list[0]);
      props.callback(list[0]);
    } else {
      props.onChange(undefined);
      props.callback(undefined);
    }
  }
  
  return (
    <div ref={ref}>
      <Upload
        accept="application/x-tar"
        name="file"
        beforeUpload={beforeUpload}
        fileList={fileList}
        onRemove={handleRemove}>
        <Button icon={<UploadOutlined style={{marginRight:10}}/>} disabled={!!fileList.length}>
          <FormattedMessage id="upload.list.Drawer.upload.button" />
        </Button>
      </Upload>
    </div>
  )
});

export default BizUpload;