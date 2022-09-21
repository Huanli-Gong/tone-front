import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { message, Space, Popover, Popconfirm } from 'antd';
import { useIntl, FormattedMessage, Access, useAccess } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons'
import moment from 'moment';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { test_type_enum, AccessTootip } from '@/utils/utils';
import ModalForm from '../ModalForm';
import { queryTableData, queryDelete } from '../../services';


export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const { ws_id } = props;
  const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1, page_size: 20 });
  const [visible, setVisible] = useState(false);
  const access = useAccess();
  // 1.请求数据
  const getTableData = async (query: any) => {
    props.loadingCallback({ loading: true })
    try {
      const res = await queryTableData({ ws_id, ...query }) || {}
      if (res.code === 200) {
        const { data = [], total = 0, page_num = 1, page_size = 20 } = res
        setData({
          data, total, page_num, page_size
        })
        // 将total回传给父级组件
        props.refreshCallback(total)
      } else {
        message.error(res.msg || formatMessage({id: 'request.failed'}) )
      }
      props.loadingCallback({ loading: false })
    } catch (e) {
      props.loadingCallback({ loading: false })
    }
  }
  // 2.删除
  const deleteClick = (record: any) => {
    queryDelete({ pk: record.id }).then((res) => {
      if (res.code === 200) {
        message.success( formatMessage({id: 'request.delete.success'}) );
        const { page_num, page_size } = data
        getTableData({ page_num, page_size });
      } else {
        message.error(res.msg || formatMessage({id: 'request.delete.failed'}) );
      }
    })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    const { page_num, page_size } = data
    getTableData({ page_num, page_size })
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      showModal: () => {
        setVisible(true);
      },
    })
  )

  const hiddenModalCallback = (info: any) => {
    const { title } = info;
    if (title === 'ok') {
      getTableData({ page_num: 1, page_size: 20 });
    }
    setVisible(false);
  };


  const onChange = (page: number, pageSize: number) => {
    getTableData({ page_num: page, page_size: pageSize })
  }

  const Question = ({ content = '' }) => (
    <Popover placement="top" content={<><FormattedMessage id="upload.list.table.state.question" />{content}</>}>
      <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.55)'}}/>
    </Popover>
  )

  /**
   * 状态state：
   *    ('file', '文件上传中'),
   *    ('running', '文件解析中'),
   *    ('success', '成功'), 
   *    ('fail', '失败'),
   */
  const StateFlag = ({ title = '', content = '' }) => {
    switch (title) {
      case 'file': return <span style={{ color: '#649FF6', fontFamily: 'PingFangSC-Semibold' }}>Upload</span>
      case 'running': return <span style={{ color: '#649FF6', fontFamily: 'PingFangSC-Semibold' }}>Upload</span>
      case 'success': return <span style={{ color: '#81BF84', fontFamily: 'PingFangSC-Semibold' }}>Success</span>
      case 'fail': return <span style={{ color: '#C84C5A', fontFamily: 'PingFangSC-Semibold' }}>Fail <Question content={content} /></span>
      default: return <>-</>
    }
  }

  const columns = [
    {
      title: <FormattedMessage id="upload.list.table.product" />,
      dataIndex: 'product_name',
      ellipsis: {
        showTitle: false
      },
      onCell: () => ({ style: { whiteSpace: 'nowrap', maxWidth: 150 }, }),
      render: (text: any) => <PopoverEllipsis title={text} />,
    },
    {
      title: <FormattedMessage id="upload.list.table.project" />,
      dataIndex: 'project_name',
      ellipsis: {
        showTitle: false
      },
      onCell: () => ({ style: { whiteSpace: 'nowrap', minWidth: 100 }, }),
      render: (text: any) => <PopoverEllipsis title={text} />,
    },
    {
      title: <FormattedMessage id="upload.list.table.state" />,
      dataIndex: 'state',
      onCell: () => ({ style: { whiteSpace: 'nowrap', maxWidth: 100 }, }),
      render: (text: any, record: any) => <StateFlag title={text} content={record.state_desc} />,
    },
    {
      title: <FormattedMessage id="upload.list.table.testType" />,
      dataIndex: 'test_type',
      onCell: () => ({ style: { minWidth: 100 } }),
      render: (text: any) => <span>{test_type_enum.filter((item: any) => item.value == text).map((item: any) => formatMessage({id: item.value}) )}</span>,
    },
    {
      title: <FormattedMessage id="upload.list.table.baseline" />,
      dataIndex: 'baseline_name',
      ellipsis: {
        showTitle: false
      },
      onCell: () => ({ style: { minWidth: 100 } }),
      render: (text: any) => <PopoverEllipsis title={text} />,
    },
    {
      title: <FormattedMessage id="upload.list.table.uploader" />,
      dataIndex: 'uploader',
      onCell: () => ({ style: { minWidth: 100 } }),
      render: (text: any) => <span>{text || '-'}</span>,
    },
    {
      title: <FormattedMessage id="upload.list.table.date" />,
      dataIndex: 'gmt_created',
      ellipsis: {
        showTitle: false
      },
      onCell: () => ({ style: { maxWidth: 170 } }),
      render: (text: any) => <span>{text ? moment(text).format('YYYY-MM-DD HH:mm') : '-'}</span>,
    },
    {
      title: <FormattedMessage id="Table.columns.operation" />,
      ellipsis: {
        showTitle: false
      },
      onCell: () => ({ style: { minWidth: 118 } }),
      render: (text: any, record: any) => (
        <Space>
          {['file', 'running', 'fail'].includes(record.state) ? (
            <>
              <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.view" /></span>
              <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.download" /></span>
            </>
          ) : (
            <>
              <a href={record.job_link} target="_blank" rel="noopener noreferrer"><FormattedMessage id="operation.view" /></a>
              <Access accessible={access.WsTourist()}>
                <Access
                  accessible={access.WsMemberOperateSelf(record.creator)}
                  fallback={
                    <Space>
                      <a onClick={() => AccessTootip()}><FormattedMessage id="operation.download" /></a>
                      <a onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></a>
                    </Space>
                  }
                >
                  <Space>
                    <a onClick={() => {
                      const a = document.createElement('a');
                      a.href = record.file_link;
                      a.click();
                    }}><FormattedMessage id="operation.download" /></a>
                    <Popconfirm
                      placement="topRight"
                      title={<FormattedMessage id="delete.prompt" />}
                      onConfirm={() => deleteClick(record)}
                      okText={<FormattedMessage id="operation.confirm" />}
                      cancelText={<FormattedMessage id="operation.cancel" />}
                    >
                      <a><FormattedMessage id="operation.delete" /></a>
                    </Popconfirm>
                  </Space>
                </Access>
              </Access>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <CommonTable
        loading={false}
        columns={columns}
        total={data.total}
        page={data.page_num}
        pageSize={data.page_size}
        list={data.data}
        handlePage={onChange}
      />

      <ModalForm ws_id={ws_id} visible={visible} callback={hiddenModalCallback} />
    </div>

  )
});

