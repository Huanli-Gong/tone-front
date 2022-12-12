import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Table, Drawer, Divider, Row } from 'antd'
import { queryServerHistory } from './service'
import { FormattedMessage, useIntl } from 'umi';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './style.less'
import { isArray } from 'lodash';

const handleCategoryType = (key: any) => {
    if (key === '0') return <FormattedMessage id='operation.not.release' />
    if (key === '1') return <FormattedMessage id='operation.release' />
    if (key === '2') return <FormattedMessage id='device.failed.save' />
    if (key === 'cloud') return <FormattedMessage id='device.cloud' />
    if (key === 'cloud_efficiency') return <FormattedMessage id="device.cloud_efficiency" />
    if (key === 'cloud_ssd') return <FormattedMessage id="device.cloud_ssd" />
    if (key === 'cloud_essd') return <FormattedMessage id="device.cloud_essd" />
    return key
}
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
        const { formatMessage } = useIntl()
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

        // 内网单机: 字段名匹配
        const matchFieldName = (params: string) => {
            // 表单字段名 对应的 中文
            const listName = [
                { fieldName: 'template_name', text: '配置名称' },
                { fieldName: 'release_rule', text: '用完释放' },
                { fieldName: 'manufacturer', text: '云厂商/Ak' },
                { fieldName: 'zone', text: 'Region/Zone' },
                { fieldName: 'instance_type', text: '规格' },
                { fieldName: 'storage_type', text: '数据盘' },
                { fieldName: 'image', text: '镜像' },
                { fieldName: 'system_disk_category', text: '系统盘' },
                { fieldName: 'bandwidth', text: '带宽' },
                { fieldName: 'extra_param', text: '扩展字段' },
                { fieldName: 'image_name', text: '镜像' },
                { fieldName: 'channel_type', text: '控制通道' },
                { fieldName: 'ips', text: '机器' },
                { fieldName: 'ip', text: '机器' },
                { fieldName: 'name', text: '机器名称' },
                { fieldName: 'state', text: '使用状态' },
                { fieldName: 'description', text: '备注' },
                { fieldName: 'owner', text: 'Owner' },
                { fieldName: 'tag', text: '标签' },
                { fieldName: 'private_ip', text: '私网IP' },
                /** 数组值 */
            ];
            const listItem = listName.filter((item) => params === item.fieldName);
            return listItem.length ? formatMessage({ id: `log.listName.${listItem[0].fieldName}`}) : handleCategoryType(params); // listItem[0].text
        }

        // 遍历单元格内变更的字段名。
        const renderCell = (vals: any) => vals.map((key: any, index: number) => {
            let val = ''
            if(isArray(key) && !!key.length){
                val = JSON.stringify(key)
            } else {
                val = String(key)
            }
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


        const logColumnsProps = {
            align: 'center',
            className: 'log_td',
        }

        const columns: any = [
            {
                title: <FormattedMessage id="log.columns.operation_type" />,
                align: 'center',
                dataIndex: 'operation_type'
            },
            {
                title: <FormattedMessage id="log.columns.edit.content" />,
                align: 'center',
                children: [
                    {
                        title: <FormattedMessage id="log.columns.fieldName" />,
                        render: (_: any) => renderCell(Object.keys(JSON.parse(_.new_values))),
                        ...logColumnsProps
                    },
                    {
                        title: <FormattedMessage id="log.columns.old_values" />,
                        render: (_: any) => renderCell(Object.values(JSON.parse(_.old_values))),
                        ...logColumnsProps
                    },
                    {
                        title: <FormattedMessage id="log.columns.new_values" />,
                        render: (_: any) => renderCell(Object.values(JSON.parse(_.new_values))),
                        ...logColumnsProps
                    },
                ]
            },
            {
                title: <FormattedMessage id="log.columns.creator" />,
                align: 'center',
                dataIndex: 'creator'
            },
            {
                title: <FormattedMessage id="log.columns.gmt_created" />,
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
                title={<FormattedMessage id="log.operation.title" />} // "操作日志"
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