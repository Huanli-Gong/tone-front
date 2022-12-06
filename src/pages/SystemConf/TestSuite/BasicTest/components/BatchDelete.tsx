import React, { useContext, useState } from 'react';
import { Affix, Typography, Checkbox, Row, Space, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'umi'
import { TestContext } from '../../Provider';
import { delBentch } from '../../service';
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import styled from 'styled-components'

const BatchRow = styled(Row)`
    padding-right : 20px;
    margin-top: 16px;
    height:64px;
    width:100%;
    line-height: 64px;
    background-color: #fff;
    padding-left:24px;
    box-shadow:0 -9px 28px 8px rgba(0,0,0,0.05), 0 -6px 16px 0 rgba(0,0,0,0.08), 0 -3px 6px -4px rgba(0,0,0,0.12);
`
const BatchDelete = () => {
    const { formatMessage } = useIntl()
    const {
        selectedRowKeys,
        setSelectedRowKeys,
        selectedRow,
        confDrawerShow,
        confRefresh,
        setConfRefresh
    } = useContext<any>(TestContext)
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const handleBentch = async() => {
        const data = await queryConfirm({ flag: 'pass', case_id_list: selectedRowKeys.join(',') })
        if (data.code === 200) setDeleteVisible(true)
        else setDeleteDefault(true)
    }
    const remAll = async () => {
        const params = { id_list: selectedRowKeys.join(','), }
        setSelectedRowKeys([])
        await delBentch(params)
        setConfRefresh(!confRefresh)
    }

    const onBentch = () => {
        confDrawerShow('batch.edit', { bentch: true }) // 批量编辑Test Conf
    }

    const handleDetail = () => {
        let newData: any = []
        selectedRow.map((item: any) => newData.push(item.name))
        window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
    }
    return (
        <>
            <Affix offsetBottom={16}>
                <BatchRow justify="space-between" >
                    <Space>
                        <Checkbox indeterminate={true} />
                        <Typography.Text>{formatMessage({id: 'selected.item'}, {data: selectedRowKeys.length})}</Typography.Text>
                        <Button type="link" onClick={() => setSelectedRowKeys([])}><FormattedMessage id="operation.cancel"/></Button>
                    </Space>
                    <Space>
                        <Button onClick={handleBentch}><FormattedMessage id="operation.batch.delete"/></Button>
                        <Button type="primary" onClick={onBentch}><FormattedMessage id="operation.batch.edit"/></Button>
                    </Space>
                </BatchRow>
            </Affix>
            <Modal
                title={<FormattedMessage id="delete.tips"/>}
                footer={[
                    <Button key="submit" onClick={remAll}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                centered={true}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="TestSuite.conf.delete.warning"/>
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    <FormattedMessage id="TestSuite.conf.delete.range"/>
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.reference.details"/></div>
            </Modal>
            <Modal
                title={<FormattedMessage id="delete.tips"/>}
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remAll}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    <FormattedMessage id="delete.prompt"/>
                </div>
            </Modal>
        </>
    )
}

export default BatchDelete;