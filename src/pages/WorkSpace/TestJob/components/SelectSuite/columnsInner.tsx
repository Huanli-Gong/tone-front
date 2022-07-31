import React from 'react'
import { Button, Tooltip } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import { noop, isNull } from 'lodash'
import styles from './style.less'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import Tag from 'antd/es/tag'

interface ColumnsProp {
    openCase: any,
    checked: boolean,
    contrl: any,
    disabled: boolean,
    onDataSourceChange: any,
    dataSource: any,
    run_mode: string,
    width: number
}

export default (props: ColumnsProp) => {
    const {
        openCase = noop,
        checked = false,
        contrl,
        disabled = false,
        onDataSourceChange = noop,
        dataSource,
        run_mode = '',
        width
    } = props
    const onRemove = (key: string) => {
        const list = dataSource.filter(
            (item: any) => {
                const test_case_list = item.test_case_list.filter(
                    (el: any) => {
                        if (key !== el.id) return el
                    }
                )
                if (test_case_list.length > 0) {
                    let obj = item
                    obj.test_case_list = test_case_list
                    return obj
                }
            }
        )
        onDataSourceChange(list, run_mode)
    }

    const name = {
        title: 'Test Conf',
        dataIndex: 'title',
        width: 200,
        ellipsis: {
            shwoTitle: false,
        },
        render: (_: any) => (
            _ ?
                <Tooltip placement="topLeft" title={_}>
                    {_}
                </Tooltip> :
                '-'
        ),
    }

    const ip = {
        title: '机器',
        ellipsis: {
            shwoTitle: false,
        },
        width: 150,
        render: (_: any, row: any) => {
            const { server_tag_id } = row
            if (server_tag_id && server_tag_id.length > 0) {
                const tagList = row.ip ? row.ip.split(',').map((t: any) => <Tag key={t}>{t}</Tag>) : '随机'
                return (
                    <Tooltip placement="topLeft" title={tagList} >
                        {tagList}
                    </Tooltip >
                )
            }

            if (isNull(row.ip) && JSON.stringify(row.customer_server) !== '{}') {
                return (
                    <Tooltip placement="topLeft" title={row.customer_server?.custom_ip || ''}>
                        {row.customer_server?.custom_ip || ''}
                    </Tooltip>
                )
            }

            return (
                <Tooltip placement="topLeft" title={row.ip || '随机'}>
                    {row.ip || '随机'}
                </Tooltip>
            )
        },
    }

    const repeat = {
        title: 'repeat',
        dataIndex: 'repeat',
        width: 80,
    }

    const reboot = {
        title: '重启',
        dataIndex: 'reboot',
        // className: styles.action,
        render: (_: any, row: any) => row.need_reboot ? '是' : '否',
        width: 80,
    }

    const script = {
        title: '脚本',
        width: 100,
        dataIndex: 'script',
        // className: styles.var,
        render: (_: any, row: any) => row.setup_info || row.cleanup_info ?
            <PopoverEllipsis title={`[重启前]:${row.setup_info || '-'}，[重启后]:${row.cleanup_info || '-'}`} width={'150px'}></PopoverEllipsis>
            : '-'
    }

    const monitor = {
        title: '监控',
        dataIndex: 'monitor',
        render: (_: any, row: any) => row.console === undefined ? '-' : row.console ? '是' : '否',
        width: 100,
    }

    const variable = {
        title: '变量',
        dataIndex: 'variable',
        width: 150,
        render: (_: number, row: any) => {
            if (row.env_info && row.env_info.length > 0) {
                const str = row.env_info.map((item: any, index: number) => {
                    return item.name ? `${item.name || ''}=${item.val || ''};` : '-'
                })
                return (
                    <EllipsisPulic title={str} width={150}/>
                )
            }
            return '-'
        },
    }

    const priority = {
        title: '执行优先级',
        dataIndex: 'priority',
        width: 150,
    }

    const option = {
        title: '操作',
        dataIndex: 'title',
        width: 65,
        fixed: 'right',
        render: (_: any, row: any, index: number) => (
            !disabled &&
            <>
                <Button
                    type="link"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => openCase(index, row)}
                >
                    配置
                </Button>
                <MinusCircleOutlined
                    className={styles.remove}
                    onClick={() => onRemove(row.id)}
                />
            </>
        )
    }

    if (checked) {
        let columns = [{
            ...name,
            fixed: 'left',
        }, ip, repeat]

        if ('reboot' in contrl) columns.push(reboot)
        if ('script' in contrl) columns.push(script)
        if ('monitor' in contrl) columns.push(monitor)
        if ('variable' in contrl) columns.push(variable)

        columns.push(priority)
        columns.push({
            ...option,
            fixed: 'right',
        })
        const resultColumnsWidth = columns.reduce((pre: any, cur: any) => pre += cur.width, 0)
        const checkedWidth = width - 8
        if (resultColumnsWidth < checkedWidth) {
            const elseWidth = checkedWidth - name.width - option.width - 30 - 2;
            const elseColumnWidth = elseWidth / (columns.length - 2)

            return columns.reduce((pre: any, cur: any) => {
                if (cur.dataIndex === 'title') return pre.concat(cur)
                return pre.concat({ ...cur, width: elseColumnWidth })
            }, [])
        }
        return columns
    }
    else {
        const newColumns = [
            name,
            ip,
            repeat,
            priority,
            option
        ]

        let newColumnsWidth = newColumns.reduce((pre: any, cur: any) => pre += cur.width, 0)
        const checkedWidth = width - 8
        if (newColumnsWidth < checkedWidth) {
            const elseWidth = width - name.width - option.width - 30 - 10;
            const elseColumnWidth = elseWidth / (newColumns.length - 2)

            return newColumns.reduce((pre: any, cur: any) => {
                if (cur.dataIndex === 'title') return pre.concat(cur)
                return pre.concat({ ...cur, width: elseColumnWidth })
            }, [])
        }

        return newColumns
    }
}



    // const colors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"]
    // function randomNum(minNum: any, maxNum: any ) {
    //     return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
    // }