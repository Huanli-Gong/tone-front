import React, { useState, useRef } from 'react';
import { Tabs, Tooltip, Drawer } from 'antd';
import { CaretRightFilled, CaretDownFilled, EditOutlined } from '@ant-design/icons';
import styles from '../../style.less';
import MetricTable from '../../components/MetricTable';
import CommonTable from '@/components/Public/CommonTable';
import CodeViewer from '@/components/CodeViewer'
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';

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

    const columns: any = [
        {
            title: 'Test Conf', dataIndex: 'name',
            ellipsis: true, width: 300,
            fixed: 'left',
            render: (_: any) => <EllipsisPulic title={_} />
        },
        { title: '别名', dataIndex: 'alias', width: 100, ellipsis: true },
        {
            title: '领域', dataIndex: 'domain_name_list', width: 100,
            render: (t: any) => {
                return t || '-'
            }
        },
        { title: 'Timeout(s)', dataIndex: 'timeout', width: 100 },
        { title: '默认运行次数', dataIndex: 'repeat', width: 120, ellipsis: true },
        {
            title: '变量', dataIndex: 'var', ellipsis: true,
            width: 120,
            render: (_: number, row: any) =>
                <PopoverEllipsis
                    title={
                        row.var && JSON.parse(row.var).map((item: any, index: number) => {
                            return <p key={index}>{`${item.name}=${item.val},${item.des || '-'}`};</p>
                        })
                    }
                >
                    <span>
                        {
                            row.var && row.var != '[]' ? JSON.parse(row.var).map((item: any) => {
                                return `${item.name}=${item.val},${item.des || '-'};`
                            }) : '-'
                        }
                    </span>
                </PopoverEllipsis>,
        },
        {
            title: '说明', dataIndex: 'doc', width: 120, ellipsis: true,
            render: (_: any, row: any) => (
                <div>
                    <ButtonEllipsis
                        title={row.doc}
                        isCode={true}
                        width={90}
                        onClick={() => {
                            setShow(true)
                            setDes(row.doc)
                        }}
                    />
                </div>
            )
            // render: (text:string) =><Typography.Text>{ text || '-'}</Typography.Text>
        },
        { title: '创建时间', dataIndex: 'gmt_created', width: 170 },
    ];

    return (
        <div className={styles.warp}>
            {
                type == 'performance' &&
                <Tabs defaultActiveKey={'case'} activeKey={innerKey} onChange={(key) => handleInnerTab(key)} >
                    <TabPane tab="Test Conf" key="case"></TabPane>
                    <TabPane tab="指标" key="suite" ></TabPane>
                </Tabs>
            }
            {
                innerKey === 'case' ?
                    <CommonTable
                        scrollType={1030}
                        columns={columns}
                        list={record}
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
                    /> :
                    <MetricTable ws_id={ws_id} id={id} innerKey={innerKey} />
            }
            <Drawer
                maskClosable={false}
                keyboard={false}
                width={376}
                title="说明详情"
                onClose={() => setShow(false)}
                visible={show}
            >
                <CodeViewer code={des} />
            </Drawer>
        </div>
    );
};

export default SuiteManagement;


