import React, { useState } from "react";
import { Divider, Spin, Layout, Typography, Row, Col, Tooltip } from 'antd';
import { queryTidMessage } from '../service'
import { requestCodeMessage } from "@/utils/utils";
import CodeEditer from '@/components/CodeEditer'
import styled from 'styled-components';
import { useParams } from "umi";

const TidRow = styled(Row)`
    & div:first-child {
        text-align: right;
        font-size: 14px;
        color: rgba(0,0,0,.45);
        &::after {
            content: ':'
        }
    }
    
    & div:last-child {
        font-size: 14px;
        color: #000000;
    }
`

const SegmentationMark = styled.span`
    float: left;
    width:2px;
    height:14px;
    background: #1890ff;
    margin: 5px 8px 0 0;
`

const DataRow: React.FC<any> = ({ name, field }) => {
    return (
        <TidRow gutter={20} >
            <Col span={6}>{name}</Col>
            <Col span={18}>{field || '-'}</Col>
        </TidRow>
    )
}

const infoRowFields = [
    ['TID', 'tid'],
    ['Sync', 'sync'],
    ['Env', 'env'],
    ['Args', 'args'],
    ['Cwd', 'cwd'],
    ['Timeout', 'timeout'],
    ['IP', 'ip'],
    ['SN', 'sn'],
    ['TSN', 'tsn'],
]

const stateRowFields = [
    ['Status', 'status'],
    ['Delivery time', 'delivery_time'],
    ['Start time', 'start_time'],
    ['Finish time', 'finish_time'],
    ['Exit code', 'exit_code'],
    ['Error code', 'error_code'],
    ['Error msg', 'error_msg'],
    ['Pid', 'pid'],
]

const BlockContent: React.FC<any> = ({ title, list, source }) => {
    return (
        <Layout.Content style={{ marginBottom: 20 }}>
            <Divider orientation="left" plain>
                <Typography.Text strong><SegmentationMark />{title}</Typography.Text>
            </Divider>
            {
                list.map((i: any) => {
                    const [name, field] = i
                    return (
                        <DataRow key={name} name={name} field={source?.[field]} />
                    )
                })
            }
        </Layout.Content>
    )
}

const TidDetail: React.FC<any> = ({ tid }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [details, setDetails] = useState<any>({})
    const [visible, setVisible] = useState(false)

    const { share_id } = useParams() as any

    const handleVisible = async ($visible: boolean) => {
        if ($visible) {
            setLoading(true)
            const { data, code, msg } = await queryTidMessage({ tid, share_id })
            setLoading(false)
            setVisible($visible)
            if (code !== 200) {
                requestCodeMessage(code, msg)
                return
            }
            setDetails(data)
        }
        setVisible($visible)
    }

    return (
        <Tooltip
            open={visible}
            destroyTooltipOnHide
            overlayStyle={{
                width: 510,
                maxWidth: "unset",
                padding: 0,
                maxHeight: 400,
                overflowY: "auto",
                boxShadow: "-12px 0 48px 16px rgba(0,0,0,0.03), -9px 0 28px 0 rgba(0,0,0,0.05), -6px 0 16px -8px rgba(0,0,0,0.08)"
            }}
            color="#fff"
            placement="right"
            title={
                <Spin spinning={loading}>
                    <BlockContent
                        title={'任务信息'}
                        list={infoRowFields}
                        source={details}
                    />
                    <BlockContent
                        title={'任务状态'}
                        list={stateRowFields}
                        source={details}
                    />
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Divider orientation="left" plain>
                            <Typography.Text strong><SegmentationMark />任务结果</Typography.Text>
                        </Divider>
                        <Row gutter={20} style={{ margin: '0 10px', height: 200 }}>
                            <CodeEditer code={details?.result} />
                        </Row>
                    </Layout.Content>
                </Spin>
            }
            onOpenChange={handleVisible}
        >
            <span style={{ cursor: loading ? 'progress' : 'default' }}>
                {tid || '-'}
            </span>
        </Tooltip>
    )
}

export default TidDetail;

{
    /* 
        <Layout.Content style={{ marginBottom: 20 }}>
            <Divider orientation="left" plain>
                <Typography.Text strong><SegmentationMark/>任务脚本</Typography.Text>
            </Divider>
            <Row gutter={20} style={{ margin:'0 10px', height: 200 }}>
                <CodeEditer code={details.script} />
            </Row>
        </Layout.Content> 
    */
}
