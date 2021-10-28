import React, { useContext, useState } from 'react';
import { Affix, Typography, Checkbox, Row, Space, Button, Popconfirm, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { TestContext } from './Provider';
import { delBentch } from './service';
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import styled from 'styled-components'

const Warpper = styled.div`
    position:fixed;
    bottom:16px;
    width: 1115px;
    height: 64px;
`
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
        confDrawerShow('批量编辑Test Conf', { bentch: true })
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
                        <Typography.Text>已选择{selectedRowKeys.length}项</Typography.Text>
                        <Button type="link" onClick={() => setSelectedRowKeys([])}>取消</Button>
                    </Space>
                    <Space>
                        <Button onClick={handleBentch}>批量删除</Button>
                        <Button type="primary" onClick={onBentch}>批量编辑</Button>
                    </Space>
                </BatchRow>
            </Affix>
            <Modal
                title="删除提示"
                footer={[
                    <Button key="submit" onClick={remAll}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        取消
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
                    conf已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    删除conf影响范围：运行中的job、测试模板、对比分析报告
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            <Modal
                title="删除提示"
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remAll}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        取消
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    确定要删除吗？
                </div>
            </Modal>
        </>
    )
}

export default BatchDelete;