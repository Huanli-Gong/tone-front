import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Table, Drawer, Divider, Row } from 'antd'
import { queryServerHistory } from './service'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './style.less'

// 内网单机: 字段名匹配
const matchFieldName = (params: string) => {
    // 表单字段名 对应的 中文
    const listName = [
        { fieldName: 'channel_type', text: '控制通道' },
        { fieldName: 'ips', text: '机器' },
        { fieldName: 'ip', text: '机器' },
        { fieldName: 'name', text: '机器名称' },
        { fieldName: 'state', text: '使用状态' },
        { fieldName: 'description', text: '备注' },
        { fieldName: 'owner', text: 'Owner' },
        { fieldName: 'tag', text: '标签' },
        { fieldName: 'private_ip', text: '私网IP' },
    ];
    const listItem = listName.filter((item) => params === item.fieldName);
    return listItem.length ? listItem[0].text : params;
}

// 遍历单元格内变更的字段名。
const renderCell = (vals: any) => vals.map((key: any, index: number) => {
    let val = String(key)
    return (
        <Row justify="center" key={index}>
            <Row justify="center" className={styles.cell}>
                {
                    val && !!val.length ?
                        <EllipsisPulic title={matchFieldName(val)} width={160}>{matchFieldName(val)}</EllipsisPulic>
                        : '-'
                }
            </Row>
            {index !== vals.length - 1 && <Divider className={styles.no_margin_line} />}
        </Row>
    )
})

// 'machine_server_tag':'调度标签'

// 'machine_test_server': '集团单机',
// 'machine_cluster_aligroup': '集团集群',
// 'machine_cluster_aligroup_server': '集团集群-机器',

// 'machine_cloud_server': '云上单机',
// 'machine_cluster_aliyun': '云上集群',
// 'machine_cluster_aliyun_server': '云上集群-机器',

interface LogDrawerProps {
    operation_object: string,
}

export default forwardRef(
    ({ operation_object }: LogDrawerProps, ref: any) => {
        const [dataSource, setDataSource] = useState<any>({})
        const [visible, setVisible] = useState(false)
        const [loading, setLoading] = useState(true)

        const getList = async (pid: any) => {
            setLoading(true)
            const data = await queryServerHistory({ operation_object, pid })
            setDataSource(data || {})
            setLoading(false)
        }

        useImperativeHandle(
            ref,
            () => ({
                show: (pid: number) => {
                    setVisible(true)
                    getList(pid)
                }
            })
        )

        const logColumnsProps = {
            align: 'center',
            className: 'log_td',
        }

        const columns: any = [
            {
                title: '变更含义',
                align: 'center',
                dataIndex: 'operation_type'
            },
            {
                title: '编辑内容',
                align: 'center',
                children: [
                    {
                        title: '变更字段',
                        render: (_: any) => renderCell(Object.keys(JSON.parse(_.new_values))),
                        ...logColumnsProps
                    },
                    {
                        title: '变更前值',
                        render: (_: any) => renderCell(Object.values(JSON.parse(_.old_values))),
                        ...logColumnsProps
                    },
                    {
                        title: '变更后值',
                        render: (_: any) => renderCell(Object.values(JSON.parse(_.new_values))),
                        ...logColumnsProps
                    },
                ]
            },
            {
                title: '操作人',
                align: 'center',
                dataIndex: 'creator'
            },
            {
                title: '操作时间',
                align: 'center',
                dataIndex: 'gmt_created'
            },
        ]

        const handleClose = () => {
            setVisible(false)
            setDataSource({})
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                visible={visible}
                forceRender={true}
                title="操作日志"
                onClose={handleClose}
                width="910"
            >
                <Table
                    loading={loading}
                    rowKey="id"
                    size="small"
                    className={styles.log_table}
                    bordered
                    pagination={{
                        //hideOnSinglePage: true,
                        pageSize: dataSource.page_size || 10,
                    }}
                    columns={columns}
                    dataSource={dataSource.data && dataSource.data.filter((item: any) => item.new_values !== '{}')} // 过滤掉空的行数据。
                />
            </Drawer>
        )
    }
)