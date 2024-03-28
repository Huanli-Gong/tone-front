import React, { useState, useEffect } from 'react';
import { Table, message, Row, Divider } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { FormattedMessage, useIntl, useParams, } from 'umi';
import moment from 'moment';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import EllipsisPublic from '@/components/Public/EllipsisPulic';
import SearchInput from '@/components/Public/SearchInput';
import { queryOperationLog } from './services'
import styles from './style.less';

const handleCategoryType = (key: any) => {
  if (key === '0') return <FormattedMessage id='operation.not.release' />
  if (key === '1') return <FormattedMessage id='operation.release' />
  if (key === '2') return <FormattedMessage id='device.failed.save' />
  if (key === 'cloud') return <FormattedMessage id='device.cloud' />
  if (key === 'cloud_efficiency') return <FormattedMessage id="device.cloud_efficiency" />
  if (key === 'cloud_ssd') return <FormattedMessage id="device.cloud_ssd" />
  if (key === 'cloud_essd') return <FormattedMessage id="device.cloud_essd" />
  return key
}

const Index = (props: any) => {
  const { formatMessage } = useIntl()
  const { ws_id } = useParams() as any
  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1 })
  const [pageSize, setPageSize] = useState<number>(20)
  //
	const [autoFocus, setFocus] = useState<boolean>(true)
	const [operation_type, setTid] = useState<string>()


  // 1.请求数据
  const getTableData = async (query: any) => {
    setLoading(true)
    try {
      const res = await queryOperationLog({ page_size: pageSize, ws_id,  ...query });
      const { code, msg } = res || {}
      if (code === 200) {
        setData(res)
      } else {
        message.error(msg || formatMessage({ id: 'request.data.failed'}) );
      }
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  // 过滤查询
	useEffect(() => {
		getTableData({ page_num: 1, operation_type })
  }, [operation_type]);

  // 内网单机: 字段名匹配
  const matchFieldName = (params: string) => {
    // 字段名 对应的 中文
    const listName = [
        { fieldName: 'template_name', text: '配置名称' },
        { fieldName: 'release_rule', text: '用完释放' },
        { fieldName: 'manufacturer', text: '云厂商/Ak' },
        { fieldName: 'zone', text: 'Region/Zone' },
        { fieldName: 'instance_type', text: '规格' },
        { fieldName: 'storage_type', text: '数据盘' },
        { fieldName: 'image', text: '镜像' },
        { fieldName: 'system_disk_category', text: '系统盘' },
        { fieldName: 'bandwidth', text: '带宽' },
        { fieldName: 'extra_param', text: '扩展字段' },
        { fieldName: 'image_name', text: '镜像' },
        { fieldName: 'channel_type', text: '控制通道' },
        { fieldName: 'ips', text: '机器' },
        { fieldName: 'ip', text: '机器' },
        { fieldName: 'name', text: '机器名称' },
        { fieldName: 'state', text: '使用状态' },
        { fieldName: 'description', text: '备注' },
        { fieldName: 'owner', text: 'Owner' },
        { fieldName: 'tag', text: '标签' },
        { fieldName: 'private_ip', text: '私网IP' },
    ];
    const listItem = listName.filter((item) => params === item.fieldName);
    return listItem.length ? formatMessage({ id: `log.listName.${listItem[0].fieldName}` }): handleCategoryType(params); // listItem[0].text
  }

  // 遍历单元格内变更的字段名
  const renderCell = (nameList: any) => {
    const list = nameList.map((key: any, index: number) => {
      let val = ''
      if (Array.isArray(key) && key.length) {
          val = JSON.stringify(key)
      } else {
          val = String(key)
      }
      return (
        <Row justify="center" key={index}>
            <Row justify="center" className={styles.cell}>
                {val?.length ?
                  <EllipsisPublic title={matchFieldName(val)} width={160}>{matchFieldName(val)}</EllipsisPublic>
                  : '-'
                }
            </Row>
            {index !== nameList.length - 1 && <Divider className={styles.no_margin_line} />}
        </Row>
      )
    })
    return nameList?.length? list: '-'
  }

	const columns: any = [
		{
			title: <FormattedMessage id="log.table.TID" />,
			dataIndex: 'operation_type',
			fixed: 'left',
			width: 'auto',
			filterIcon: () => <FilterFilled style={{ color: operation_type ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setTid(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
						setFocus(!autoFocus)
				}
		  },
      render: (text:any) => {
				return <PopoverEllipsis title={text} width={218} />
			},
		},
		{
			title: <FormattedMessage id="log.table.operation_object" />,
			dataIndex: 'operation_object',
			onCell: () => ({ style: { maxWidth: 130 } }),
			render: (text:any) => {
				return <span className={styles.ellipsis}>{text || '-'}</span>
			},
		},
    {
      title: <FormattedMessage id="log.columns.edit.content" />,
      align: 'center',
      children: [
          {
              title: <FormattedMessage id="log.columns.fieldName" />,
              render: (_: any) => renderCell(Object.keys(JSON.parse(_.new_values))),
              align: 'center',
              className: 'log_td',
          },
          {
              title: <FormattedMessage id="log.columns.old_values" />,
              render: (_: any) => renderCell(Object.values(JSON.parse(_.old_values))),
              align: 'center',
              className: 'log_td',
          },
          {
              title: <FormattedMessage id="log.columns.new_values" />,
              render: (_: any) => renderCell(Object.values(JSON.parse(_.new_values))),
              align: 'center',
              className: 'log_td',
          },
      ]
    },
    // {
		// 	title: <FormattedMessage id="log.table.old_values" />,
		// 	dataIndex: 'old_values',
		// 	render: (text:any) => {
		// 		return <PopoverEllipsis title={text} width={120} />
		// 	}
		// },
    // {
		// 	title: <FormattedMessage id="log.table.new_values" />,
		// 	dataIndex: 'new_values',
		// 	render: (text:any) => {
		// 		return <PopoverEllipsis title={text} width={120} />
		// 	}
		// },
    {
			title: <FormattedMessage id="log.table.creator" />,
			dataIndex: 'creator',
			onCell: () => ({ style: { maxWidth: 100 } }),
		},
    {
			title: <FormattedMessage id="log.table.FinishTime" />,
			dataIndex: 'gmt_created',
		},
	];
  // 分页点击
	const onChange = (page:number, pageSize:number) => {
    setPageSize(pageSize)
    getTableData({page_num: page, page_size: pageSize })
  }

	return (
    <div className={styles.container}>
      <Table
        loading={loading}
        rowKey={(record)=> record.id}
        size="small"
        className={styles.log_table}
        bordered
        pagination={{
          pageSize: data.page_size || 10,
          current: data.page_num || 1,
          total: data.total || 0,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange,
          showTotal: (total, r)=> formatMessage({ id: 'pagination.total.strip' }, { data: total }),
        }}
        columns={columns}
        dataSource={data.data && data.data.filter((item: any) => item.new_values !== '{}')} // 过滤掉空的行数据。
      />
    </div>
  )
};

export default Index;