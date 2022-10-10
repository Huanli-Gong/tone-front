import React, { useMemo, useState } from "react";
import { Divider, Spin, Layout, Typography, Row, Col, Tooltip } from 'antd';
import { queryTidMessage } from '../service'
import { requestCodeMessage } from "@/utils/utils";
import CodeEditer from '@/components/CodeEditer'
import styled from 'styled-components';

const TidRow = styled(Row)`
    & div:first-child {
        text-align: right;
        font-size: 14px;
        color: rgba(0,0,0,.45);
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

const TidDetail: React.FC<any> = ({ tid }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [details, setDetails] = useState<any>({})
    const [visible, setVisible] = useState(false)

    const handleVisible = async ($visible: boolean) => {
        if ($visible) {
            setLoading(true)
            const { data, code, msg } = await queryTidMessage({ tid })
            if (code === 200) {
                setDetails(data)
            } else {
                requestCodeMessage(code, msg)
            }
            setLoading(false)
        }
        setVisible($visible)
    }

    const TidContainer = useMemo(()=> {
        return (
            <Spin spinning={loading}>
                <Layout.Content style={{ marginBottom: 20 }}>
                    <Divider orientation="left" plain>
                        <Typography.Text strong><SegmentationMark/>任务信息</Typography.Text>
                    </Divider>
                    <TidRow gutter={20} >
                        <Col span={6}>TID:</Col>
                        <Col span={18}>{details?.tid || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Sync:</Col>
                        <Col span={18}>{details?.sync || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Env:</Col>
                        <Col span={18}>{details?.env || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Args:</Col>
                        <Col span={18}>{details?.args || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Cwd:</Col>
                        <Col span={18}>{details?.cwd || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Timeout:</Col>
                        <Col span={18}>{details?.timeout || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>IP:</Col>
                        <Col span={18}>{details?.ip || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>SN:</Col>
                        <Col span={18}>{details?.sn || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>TSN:</Col>
                        <Col span={18}>{details?.tsn || '-'}</Col>
                    </TidRow>
                </Layout.Content>
                <Layout.Content style={{ marginBottom: 20 }}>
                    <Divider orientation="left" plain>
                        <Typography.Text strong><SegmentationMark/>任务状态</Typography.Text>
                    </Divider>
                    <TidRow gutter={20} >
                        <Col span={6}>Status:</Col>
                        <Col span={18}>{details?.status || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Delivery time:</Col>
                        <Col span={18}>{details?.delivery_time || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Start time:</Col>
                        <Col span={18}>{details?.start_time || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Finish time:</Col>
                        <Col span={18}>{details?.status || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Exit code:</Col>
                        <Col span={18}>{details?.exit_code || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Error code:</Col>
                        <Col span={18}>{details?.error_code || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Error msg:</Col>
                        <Col span={18}>{details?.error_msg || '-'}</Col>
                    </TidRow>
                    <TidRow gutter={20} >
                        <Col span={6}>Pid:</Col>
                        <Col span={18}>{details?.pid || '-'}</Col>
                    </TidRow>
                </Layout.Content>
                <Layout.Content style={{ marginBottom: 20 }}>
                    <Divider orientation="left" plain>
                        <Typography.Text strong><SegmentationMark/>任务脚本</Typography.Text>
                    </Divider>
                    <Row gutter={20} style={{ margin:'0 10px', height: 200 }}>
                        <CodeEditer code={details.script} />
                    </Row>
                </Layout.Content>
                <Layout.Content style={{ marginBottom: 30 }}>
                    <Divider orientation="left" plain>
                        <Typography.Text strong><SegmentationMark/>任务结果</Typography.Text>
                    </Divider>
                    <Row gutter={20} style={{ margin:'0 10px', height: 200 }}>
                        <CodeEditer code={details?.result} />
                    </Row>
                </Layout.Content>
            </Spin>
        )
    },[details, loading])
   
    return (
        <Tooltip
            visible={visible}
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
            title={TidContainer}
            onVisibleChange={handleVisible}
        >
            {tid}
        </Tooltip>
    )
}
export default TidDetail;

