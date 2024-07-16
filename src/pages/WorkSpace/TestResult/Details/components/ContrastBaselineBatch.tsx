import { queryBaselineList } from '@/pages/WorkSpace/TestJob/services'
import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Form, Select, Space, Button, Row, Typography, message } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useRequest, useParams, useIntl, FormattedMessage } from 'umi'

import { queryFunctionalBaseline } from '@/pages/WorkSpace/BaselineManage/services'

import { MetricSelectProvider } from '../TestRsultTable'

const ContrastBaseline: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
  const { formatMessage } = useIntl()
  const { ws_id, id: job_id } = useParams() as any
   
  const { test_type, onOk } = props
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [drawerData, setDrawerData] = useState<any>()

  const { data: baselineList, loading: baselineLoading, run } = useRequest(
    () => queryBaselineList({ ws_id, test_type, page_size: 999 }),
    { initialData: [], manual: true }
  )

  useImperativeHandle(ref, () => ({
    show: (_: any) => {
      run()
      setDrawerData(_)
      setVisible(true)
    }
  }))

  const getCase = async (data: any[], baseline_id: any, test_suite_id: any) => {
    const promiseList = data.map(async (item) => queryFunctionalBaseline({ ...item, test_type, baseline_id, test_suite_id, page_num: 1, page_size: 9999 }));
    const res = await Promise.all(promiseList) || []
    // console.log('getCase:', res);
    return data.map((item: any, i) => ({ ...item, children: res[i]?.data || [] })
    ).filter((item: any) => item.children.length)
  }

  const getConf = async (data: any[], baseline_id: any) => {
    const promiseList = data.map((item)=> queryFunctionalBaseline({ test_suite_id: item.test_suite_id, test_type, baseline_id }))
    const res = await Promise.all(promiseList) || []
    // 
    const treeData = data.map(async (item: any, i)=> {
      const conf = res[i]?.data || []
      const confChildren = await getCase(conf, baseline_id, item.test_suite_id)
      return { ...item, children: confChildren }
    })
    return treeData
  }

  const handleClose = () => {
    setVisible(false)
    setLoading(false)
    setDrawerData(null)
    form.resetFields()
  }

  const handleOk = () => {
    form.validateFields()
      .then(async (values: any) => {
        const { baseline_id } = values
        console.log('values:', values)

        setLoading(true)
        const { code, data, msg } = await queryFunctionalBaseline({ test_type, baseline_id })
        if (code === 200) {
          // 1.获取基线树形结构
          const res = await getConf(data, baseline_id)
          // console.log('res:', res)

          let baselineData: any = []
          for await (let item of res) {
            baselineData.push(item)
          }
          // console.log('baselineData:', baselineData)

          // 2.获取基线 和 已选数据, 按“名称”匹配
          const compareData = drawerData?.map((suite: any)=> {
            const suiteItem: any = baselineData.filter((s: any)=> s.test_suite_name === suite.suite_name)[0]
            if (suiteItem) {
              return {
                ...suite,
                children: suite.children.map((conf: any)=> {
                  const confItem = suiteItem.children.filter((cf: any)=> cf.test_case_name === conf.conf_name)[0]

                  if (confItem) {
                    return {
                      ...conf,
                      children: conf.children.map((caseObj: any)=> {
                        const caseItem = confItem.children.filter((cs: any)=> cs.sub_case_name === caseObj.sub_case_name)[0]

                        if (caseItem) {
                          const { sub_case_result, bug, description, note } = caseItem
                          return { ...caseObj, sub_case_result: sub_case_result, bug, description, note  }
                        }
                        return caseObj
                      }),
                    }
                  }
                  return conf
                })
              }
            }
            return suite
          }).map((suite: any)=> ({
            ...suite, 
            children: suite.children.map((conf: any)=> ({ 
              ...conf,
              children: conf.children.map((caseObj: any)=> ({
                ...caseObj,
                sub_case_result: caseObj.sub_case_result || 'Na',
              }))
            }))
          }))
          // console.log('compareData:', compareData)

          const name = baselineList?.filter((item: any)=> baseline_id === item.id)[0].name
          onOk({ name, data: compareData })
          message.success('对比基线完成');
          
        } else {
          requestCodeMessage(code, msg)
        }
        handleClose()
        setLoading(false)
      })
      .catch((err: any) => {
        console.log(err)
        setLoading(false)
      })
  }

  return (
    <Drawer
      maskClosable={false}
      keyboard={false}
      open={visible}
      destroyOnClose
      title={<FormattedMessage id="ws.result.details.batch.baseline" />}
      onClose={handleClose}
      bodyStyle={{ padding: 0 }}
      width="376"
      footer={
        <Row justify="end" >
          <Space align="end">
            <Button onClick={handleClose} disabled={loading}><FormattedMessage id="operation.cancel" /></Button>
            <Button type="primary" onClick={handleOk} disabled={loading} loading={loading}><FormattedMessage id="operation.ok" /></Button>
          </Space>
        </Row>
      }
    >
      <Form
        form={form}
        requiredMark={false}
        layout="vertical"
        style={{ background: '#fff', padding: '10px 20px' }}
      >
        <Form.Item
          label={<FormattedMessage id="ws.result.details.baseline" />}
          name="baseline_id"
          rules={[{
            required: true,
            message: formatMessage({ id: `ws.result.details.baseline.message` })
          }]}
        >
          <Select
            loading={baselineLoading}
            placeholder={formatMessage({ id: `ws.result.details.baseline.placeholder` })}
            showSearch
            allowClear
            filterOption={(input, option) => (option?.name ?? '')?.toLowerCase().includes(input.toLowerCase())}
            options={baselineList?.map((item: any) => ({
              value: item.id,
              name: item.name,
              label: (
                <Typography.Text ellipsis={{ tooltip: true }}>
                  {item.name}
                </Typography.Text>
              )
            }))}
            // labelInValue
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default forwardRef(ContrastBaseline)