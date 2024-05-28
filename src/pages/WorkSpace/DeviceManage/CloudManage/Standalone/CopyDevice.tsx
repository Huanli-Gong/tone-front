import { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Button, Form, Input, Radio, message } from 'antd'
import { FormattedMessage, useIntl } from 'umi'
import { randomStrings, requestCodeMessage } from '@/utils/utils'
import { copyDevice } from '../service'

export default forwardRef(
    ({ onOk, instance }: any, ref: any) => {
        const { formatMessage } = useIntl()
        
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [data, setData] = useState<any>({})
        const [form] = Form.useForm()

        useImperativeHandle(
            ref,
            () => ({
                show: ( _: any = {}) => {
                  const copyName = `${_.name}-copy-${randomStrings()}`
                  form.setFieldsValue({ name: copyName, id: _.id, description: _.description })
                  //
                  setVisible(true)
                  setData(_)
                }
            }),
        )

        const handleClose = () => {
            setVisible(false)
            form.resetFields()
        }

        const handleOk = () => {
          form
              .validateFields()
              .then(async (values: any) => {
                  // console.log(values)
                  setPadding(true)
                  // const { msg, code } = await copyDevice({ ...values  })
                  // if (code === 200) {
                  //   onOk()
                  //   handleClose()
                  //   message.success(formatMessage({ id: 'operation.success' }))
                  // }
                  // else requestCodeMessage(code, msg)

                  setPadding(false)
              })
              .catch((err) => {
                  console.log(err)
                  setPadding(false)
              })
        }

        return (
            <Drawer
                title={<FormattedMessage id="device.copy" />}
                maskClosable={false}
                keyboard={false}
                open={visible}
                width="380"
                onClose={handleClose}
                bodyStyle={{ paddingTop: 12 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                <FormattedMessage id="operation.ok" />
                            </Button>
                        </Space>
                    </div>
                }
            >

                <Space style={{ paddingBottom: 12 }}>
                    <div style={{ color: 'rgba(0,0,0,.8)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {!instance ? <FormattedMessage id="device.config.name.original" />: <FormattedMessage id="device.instance.name.original" />}
                    </div>
                    <div style={{ color: ' rgba(0,0,0,0.65)' }}>{data.name}</div>
                </Space>
                
                <Form
                    layout="vertical"
                    form={form}
                >
                  <Form.Item name="id" noStyle />
                  <Form.Item
                      label={!instance ? <FormattedMessage id="device.config.name.new" />: <FormattedMessage id="device.instance.name.new" />}
                      name="name"
                      rules={[{
                          required: true,
                          message: formatMessage({ id: 'please.enter' }),
                          pattern: /^[A-Za-z0-9\._-]{1,64}$/g
                      }]}
                  >
                      <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                  </Form.Item>
                  <Form.Item
                      label={<FormattedMessage id="agent.modal.Description" />}
                      name="description">
                      <Input.TextArea rows={3} />
                  </Form.Item>

                </Form>
            </Drawer>
        )
    }
)