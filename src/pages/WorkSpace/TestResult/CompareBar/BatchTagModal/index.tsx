import { Modal, Form, Select, Tag, Empty, Spin, message, Button, Popconfirm } from 'antd';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { tagList as queryTagList } from '@/pages/WorkSpace/TagManage/service'
import { queryBatchTag } from '../../services'
import lodash from 'lodash'

// 任务标签清理时间间隔
const tag_catch = [
  {id: 'keep_three_months', name: '保留三个月'},
  {id: 'keep_six_months', name: '保留六个月'},
  {id: 'keep_one_year', name: '保留一年'},
]
const tag_catch_name = tag_catch.map((key)=> key.id)

const App = forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl()
  const { ws_id } = props
  const [visible, setVisible] = useState(false);
  const [disable, setDisable] = useState(false);
  const [jobList, setJobList] = useState([]);
  const [params, setParams] = React.useState<any>({ page_num: 1, page_size: 20 })
  const [list, setList] = React.useState([])
  const [selectedTag, setSelectedTag] = useState([]);
  const [form] = Form.useForm()

  const initialState = ()=> {
    form.resetFields()
    setVisible(false)
    setDisable(false)
    setJobList([])
    setList([])
    setSelectedTag([])
  }

  useImperativeHandle(ref, () => ({
    show: ({ data = [],  }: any) => {
      setVisible(true);
      setJobList(data)
      setParams({ page_num: 1, page_size: 20 })
    }
  }))

  const { data: tagData, loading } = useRequest(
    () => queryTagList({ ws_id, ...params }),
    { initialData: [], formatResult: (response: any) => response, refreshDeps: [params], ready: visible }
  )

  const handleTagPopupScroll = ({ target }: any) => {
    const { clientHeight, scrollHeight, scrollTop } = target
    if (clientHeight + scrollTop === scrollHeight) {
        const totalPage = params.page_num + 1
        if (totalPage <= tagData?.total_page)
            setParams((p: any) => ({ ...p, page_num: p.page_num + 1 }))
    }
  }
  React.useEffect(() => {
    if (tagData?.data) {
      setList((p: any) => p.concat(tagData?.data))
    }
  }, [tagData])


  const handleOk = () => {
    setDisable(false)
    form.validateFields().then(async (values) => {
      let q = { ...values, ws_id, job_id_list: jobList }
      const { code, msg } = await queryBatchTag(q)
      if (code === 200) {
        initialState()
        props.callback({ data: 'ok' });
      } else {
        message.error(msg || formatMessage({ id: 'request.create.failed' }));
      }
    })
  }

  const handleCancel = () => {
    initialState()
  };

  // 已选中标签中包含的time标签
  const timeTagList: any = selectedTag.filter((x: any) => tag_catch_name.indexOf(x.label) > -1 )
  

  return (
    <Modal title={<FormattedMessage id="ws.result.list.batch.add.tag.jobs" />}
      open={visible} 
      maskClosable={false}
      // onOk={handleOk} 
      onCancel={()=> { !disable && handleCancel() }}
      width={600}
      destroyOnClose={true}
      footer={[
        <Button key="back" onClick={handleCancel} disabled={disable}>
            <FormattedMessage id="operation.cancel" />
        </Button>,
        <>
          {timeTagList.length ?
            <Popconfirm
                title={formatMessage({ id: 'ws.result.details.keep.time.job.tag' }, { data: timeTagList[0].label }) }
                onConfirm={handleOk}
                okText={<FormattedMessage id="operation.ok" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
                placement="bottomRight"
                onCancel={()=> setDisable(false)}
            >
              <Button onClick={()=> setDisable(true)} type="primary"><FormattedMessage id="operation.ok" /></Button>
            </Popconfirm>
            :
            <Button key="submit" onClick={handleOk} type="primary"><FormattedMessage id="operation.ok" /></Button>
          }
        </>
      ]}
    >
      <div>
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label={<FormattedMessage id="ws.result.details.job.tag" />}
            name="tag_id"
            rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
          >
            <Select
              mode="multiple"
              loading={loading}
              size="small"
              onChange={(val: any, option: any)=> {
                const tempList = option?.map((item: any)=> ({value: item.value, label: item.label.props.children})) || []
                setSelectedTag(tempList)
              }}
              tagRender={({ label, closable, onClose, value }: any)=> (
                <Tag
                  color={label.props?.color}
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                    {label.props?.children || value}
                </Tag>
              )}
              allowClear
              onPopupScroll={handleTagPopupScroll}
              getPopupContainer={node => node.parentNode}
              onSearch={lodash.debounce((name) => {
                  setList([])
                  setParams({ page_num: 1, page_size: 20, name })
              }, 300)}
              filterOption={false}
              defaultActiveFirstOption={false}
              notFoundContent={
                loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              }
              options={
                list.map((tag: any) => {
                  // 判断：时间标签选项已有选时，则其他时间项不能再选
                  const intersect: any = selectedTag.filter((x: any) => tag_catch_name.indexOf(x.label) > -1 );
                  const disabled = tag_catch_name.includes(tag.name)? (intersect.length? (tag.name !== intersect[0].label): false): false
                  const text = disabled? <span style={{color:'#bfbfbf'}}>{tag.name}</span>: tag.name
                  return ({
                      value: tag.id,
                      label: <Tag color={tag.tag_color}>{text}</Tag>,
                      disabled,
                  })
                })
              }
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
})

export default App;