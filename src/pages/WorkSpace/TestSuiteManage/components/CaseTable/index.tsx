import React, { useState } from 'react';
import { Tabs, Tooltip, Drawer, Typography, Space } from 'antd';
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import { FormattedMessage } from 'umi'
import styles from '../../style.less';
import MetricTable from '../../components/MetricTable';
import CommonTable from '@/components/Public/CommonTable';
import CodeViewer from '@/components/CodeViewer'
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import type { TableColumnsType } from 'antd';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const SuiteManagement: React.FC<any> = ({ record, id, type, ws_id, domains }) => {
    const { TabPane } = Tabs;
    const [innerKey, setInnerKey] = useState<string>('case')
    const [expandInnerKey, setExpandInnerKey] = useState<string[]>([])
    const [show, setShow] = useState<boolean>(false)
    const [des, setDes] = useState<string>('')

    const handleInnerTab = (key: string) => {
        setInnerKey(key)
    }

    const onExpand = async (record: any) => {
        setExpandInnerKey([record.id])
    }

    const columns: TableColumnsType<AnyType> = [
        {
            title: 'Test Conf', dataIndex: 'name',
            ellipsis: true, width: 300,
            fixed: 'left',
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_} />
        },
        { title: <FormattedMessage id="suite.alias" />, dataIndex: 'alias', width: 100, ellipsis: true },
        {
            title: <FormattedMessage id="suite.domain" />, dataIndex: 'domain_name_list', width: 100,
            render: (_: any) => {
                return _ ? <Tooltip placement={'bottomLeft'} title={_}><Typography.Text style={{ width: 100 }} ellipsis>{_ || '-'}</Typography.Text></Tooltip> : '-'
            }
        },
        { title: 'Timeout(s)', dataIndex: 'timeout', width: 100 },
        { title: <FormattedMessage id="suite.repeat" />, dataIndex: 'repeat', width: 120, ellipsis: true },
        {
            title: <FormattedMessage id="suite.var" />, dataIndex: 'var', ellipsis: true,
            width: 120,
            render: (_: number, row: any) => (
                <ColumnEllipsisText
                    ellipsis={{
                        tooltip: row.var && JSON.parse(row.var).map((item: any, index: number) => {
                            return <p key={index}>{`${item.name}=${item.val},${item.des || '-'}`};</p>
                        })
                    }}
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {
                            row.var && row.var != '[]' ? JSON.parse(row.var).map((item: any, index: number) => {
                                return <p key={index}>{`${item.name}=${item.val},${item.des || '-'}`};</p>
                            }) : '-'
                        }
                    </Space>
                </ColumnEllipsisText>
            ),
        },
        {
            title: <FormattedMessage id="suite.description" />, dataIndex: 'doc', width: 120, ellipsis: true,
            render: (_: any, row: any) => (
                <ButtonEllipsis
                    title={row.doc}
                    isCode={true}
                    width={90}
                    onClick={() => {
                        setShow(true)
                        setDes(row.doc)
                    }}
                />
            )
        },
        { title: <FormattedMessage id="suite.gmt_created" />, dataIndex: 'gmt_created', width: 170 },
    ];

    return (
        <div className={styles.warp}>
            {
                type == 'performance' &&
                <Tabs defaultActiveKey={'case'} activeKey={innerKey} onChange={(key) => handleInnerTab(key)} >
                    <TabPane tab="Test Conf" key="case" />
                    <TabPane tab={<FormattedMessage id="suite.indicators" />} key="suite"  />
                </Tabs>
            }
            {
                innerKey === 'case' ?
                    <CommonTable
                        // scrollType={1030}
                        columns={columns}
                        name="ws-suite-manage-case"
                        dataSource={record}
                        loading={false}
                        showPagination={false}
                        size="small"
                        expandable={
                            type === 'performance' ?
                                {
                                    indentSize: 40,
                                    expandedRowRender: (record: any) => <MetricTable ws_id={ws_id} id={record.id} innerKey={innerKey} />,
                                    onExpand: (_: any, record: any) => _ ? onExpand(record) : setExpandInnerKey([]),
                                    expandedRowKeys: expandInnerKey,
                                    expandIcon: ({ expanded, onExpand, record }: any) =>
                                        expanded ?
                                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                                } :
                                {}
                        }
                        scroll={{ x: 1030 }}
                    /> :
                    <MetricTable ws_id={ws_id} id={id} innerKey={innerKey} />
            }
            <Drawer
                maskClosable={false}
                keyboard={false}
                width={376}
                title={<FormattedMessage id="suite.description.details" />}
                onClose={() => setShow(false)}
                visible={show}
            >
                <CodeViewer code={des} />
            </Drawer>
        </div>
    );
};

export default SuiteManagement;


