/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useImperativeHandle } from 'react'
import { Input, Modal, Button, Space, Row, } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { FormattedMessage } from 'umi'
import { saveRefenerceData } from '@/utils/utils'
export const EditTalbeCell: React.FC<any> = ({ priority, id, onChange, size }) => {
    const handleChange = ({ target }: any) => {
        if (priority === +target.value) return;
        if (typeof +target.value === 'number') {
            onChange(id, +target.value)
        }
    }

    return (
        <Input
            defaultValue={priority}
            style={{ textAlign: 'center' }}
            size={size || undefined}
            onBlur={handleChange}
        />
    )
}

const JobTypeDeleteModal: React.ForwardRefRenderFunction<any, any> = ({ onOk }, ref) => {
    const [visible, setVisible] = useState(false)
    const [data, setData] = useState<any>(undefined)

    const handleDetail = async () => {
        if (!data) return
        const pk = await saveRefenerceData({ name: data.name, id: data.id })
        if (pk)
            window.open(`/ws/${data.ws_id}/refenerce/2/?pk=${pk}`)
        // window.open(`/ws/${data.ws_id}/refenerce/2/?name=${data.name}&id=${data.id}`)
    }

    const handleOk = async () => {
        handleCancle()
        onOk(data)
    }

    const handleCancle = () => {
        console.log('cancel')
        setVisible(false)
        setData(undefined)
    }

    useImperativeHandle(
        ref,
        () => ({
            show: (_: any) => {
                setVisible(true)
                _ && setData(_)
            }
        })
    )

    return (
        <Modal
            width={600}
            title={<FormattedMessage id="job.types.delete.prompt" />}
            open={visible}
            onCancel={handleCancle}
            footer={
                <Row justify="end">
                    <Space>
                        {
                            data?.is_first ?
                                <Button disabled={true}><FormattedMessage id="job.types.confirm.Delete" /></Button> :
                                <Button onClick={handleOk}><FormattedMessage id="job.types.confirm.Delete" /></Button>
                        }
                        <Button onClick={handleCancle} type="primary"><FormattedMessage id="operation.cancel" /></Button>
                    </Space>
                </Row>
            }
        >
            {
                data?.is_first ?
                    <span><FormattedMessage id="job.types.delete.prompt1" /></span> :
                    <>
                        <div style={{ color: 'red', marginBottom: 5 }}>
                            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                            <FormattedMessage id="job.types.delete.prompt2" />
                        </div>
                        <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                            <FormattedMessage id="job.types.delete.prompt3" />：<br />
                            <FormattedMessage id="job.types.delete.prompt.ps1" /><br />
                            <FormattedMessage id="job.types.delete.prompt.ps2" />
                        </div>
                        <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>
                            <FormattedMessage id="job.types.view.reference.details" />
                        </div>
                    </>
            }
        </Modal>
    )
}

export const DelTypeModal = React.forwardRef(JobTypeDeleteModal)

/* 

<Modal
    width={600}
    title={<FormattedMessage id="job.types.delete.prompt" />}
    open={secondary}
    onCancel={handleSecondCancle}
    footer={
        <Row justify="end">
            <Space>
                {
                    data.is_first ?
                        <Button disabled={true} ><FormattedMessage id="job.types.confirm.Delete" /></Button> :
                        <Button onClick={handleOk}><FormattedMessage id="job.types.confirm.Delete" /></Button>
                }
                <Button onClick={handleSecondCancle} type="primary"><FormattedMessage id="operation.cancel" /></Button>
            </Space>
        </Row>
    }
>
    {
        data.is_first ?
            <span><FormattedMessage id="job.types.delete.prompt1" /></span> :
            <>
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="job.types.delete.prompt2" />
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    <FormattedMessage id="job.types.delete.prompt3" />：<br />
                    <FormattedMessage id="job.types.delete.prompt.ps1" /><br />
                    <FormattedMessage id="job.types.delete.prompt.ps2" />
                </div>
            </>
    }
</Modal>
*/