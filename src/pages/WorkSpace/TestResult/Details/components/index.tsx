import React, { useRef, useEffect, useState, useLayoutEffect } from 'react'
import { Tooltip, Tag, Space, Popover, Row, Col, message, Breadcrumb, Typography } from 'antd'
import styles from './index.less'
import { QuestionCircleOutlined, EditOutlined } from '@ant-design/icons'
import Clipboard from 'clipboard'
import { history, useParams } from 'umi'
import styled from 'styled-components'

export const BreadcrumbItem: React.FC<any> = (d: any, clickPath: string) => {
    const { ws_id }: any = useParams()
    return (
        <Breadcrumb style={{ marginBottom: d.bottomHeight }}>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(`/ws/${ws_id}/test_result`)}>测试结果</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>结果详情</Breadcrumb.Item>
        </Breadcrumb>
    )
}

interface CopyHookProps {
    className: string
}

export const evnPrepareState = (state: string | boolean) => {
    if (state === 'success' || state === true) return <span style={{ fontWeight: 500, color: '#81BF84' }}>Success</span>
    if (state === 'fail' || state === false) return <span style={{ fontWeight: 500, color: '#C84C5A' }}>Fail</span>
    if (state === 'running') return <span style={{ fontWeight: 500, color: '#649FF6' }}>Running</span>
    if (state === 'stop') return <span style={{ fontWeight: 500, color: '#1D1D1D' }}>Stop</span>
    if (state === 'pending') return <span style={{ fontWeight: 500, color: '#1D1D1D' }}>Pending</span>
    if (state === 'skip') return <span style={{ fontWeight: 500, color: '#1D1D1D' }}>Skip</span>
    return <></>
}

export const columnRenderDefault = (defaultText: string = '-') => ({
    render: (_: any, row: any) => (
        _ ? _ : defaultText
    )
})

export const tooltipTd = (defaultText: string = '-') => ({
    ellipsis: {
        showTitle: false,
    },
    render: (_: any) => (
        _ ?
            <Tooltip
                placement="topLeft"
                title={_}
                overlayClassName={styles.tootip_overflow}
            >
                {_}
            </Tooltip> :
            defaultText
    ),
})

export const copyHook = ({ className }: CopyHookProps) => {
    useEffect(() => {
        const clipboard = new Clipboard(className)
        clipboard.on('success', function (e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
        }
    }, [])
}

// 与copy hook配合使用 className btn name
export const ellipsisCopyColumn = (_: any, width: any = '100%') => {
    if (!_) return '-'

    const boxRef: any = useRef()
    const [show, setShow] = useState(false)

    useEffect(() => {
        const clientWidth = boxRef.current.clientWidth
        const scrollWidth = boxRef.current.scrollWidth
        setShow(clientWidth < scrollWidth)
    }, [])

    return (
        show ?
            <Row className={styles.ellips_copy_column} style={{ width }}>
                <div style={{ width: 'calc( 100% - 28px)' }} className={styles.ellips_copy_column}>{_}</div>
                <span
                    className="ellips_copy_btn"
                    style={{ color: '#4B88DD', cursor: 'pointer' }}
                    data-clipboard-text={_}
                >
                    复制
                </span>
            </Row> :
            <div
                ref={boxRef}
                style={{ width }}
                className={styles.ellips_copy_column}
            >
                {_}
            </div>
    )
}

export const EllipsisEditColumn: React.FC<any> = ({ title, width = '100%', onEdit }) => {
    const boxRef: any = useRef()
    const [show, setShow] = useState(false)

    useEffect(() => {
        const scrollWidth = boxRef.current.scrollWidth
        setShow(width - 18 < scrollWidth - 2)
    }, [title])

    return (
        <>
            {
                show ?
                    <Row style={{ width: width - 16 }} justify="start" align="middle">
                        <Tooltip placement="topLeft" title={title}>
                            <span style={{ width: width - 16 - 28 }} className={styles.ellips_copy_column}>{title}</span>
                        </Tooltip>
                        <EditOutlined style={{ marginLeft: 6, cursor: 'pointer' }} onClick={onEdit} />
                    </Row> :
                    <Row className={styles.ellips_copy_column} justify="start" align="middle" >
                        {title || '-'}
                        <EditOutlined style={{ marginLeft: 6, cursor: 'pointer' }} onClick={onEdit} />
                    </Row>
            }
            <div
                ref={boxRef}
                className={styles.ellips_column_refclass}
                style={{ width: width - 16 }}
            >
                {title || '-'}
                <EditOutlined style={{ marginLeft: 6, cursor: 'pointer' }} onClick={onEdit} />
            </div >
        </>
    )
}

export const copyTooltipColumn = (defaultText: string = '-') => ({
    ellipsis: {
        showTitle: false,
    },
    render: (_: any) => (
        _ ?
            <Tooltip
                overlayClassName={styles.tootip_overflow}
                placement='topLeft'
                title={
                    <Row>
                        <Col span={24}>{_}</Col>
                        <Col span={24}>
                            <Row justify="center">
                                <span
                                    className="test_result_tooptip_btn"
                                    style={{ cursor: 'pointer' }}
                                    data-clipboard-text={_}
                                >
                                    复制
                                </span>
                            </Row>
                        </Col>
                    </Row>
                }
            >
                {_}
            </Tooltip> :
            defaultText
    )
})

export const compareResultFontColor = (result: string) => {
    if (result === 'decline') return '#C84C5A'
    if (result === 'normal') return '#000000'
    if (result === 'increase') return '#81BF84'
    return ''
}

export const compareResultSpan = (track_result: string, result: string) => {
    if (track_result === 'decline') return <span style={{ color: '#C84C5A' }}>{result}</span>
    if (track_result === 'normal') return <span style={{ color: '#000000' }}>{result}</span>
    if (track_result === 'increase') return <span style={{ color: '#81BF84' }}>{result}</span>
    return result || '-'
}

const StateTagCls = styled(Tag) <{ no_margin?: boolean }>`
    font-weight: 500;
    width: 72px;
    text-align: center;
    ${({ no_margin }) => no_margin ? 'margin-right: 0;' : ''}
    text-transform: capitalize;
`

const RenderStateTag: React.FC<any> = (props) => {
    return (
        <StateTagCls
            {...props}
        />
    )
}

const TooltipStateTag: React.FC<any> = (props) => {
    return (
        <Tooltip
            title="Job状态"
            placement="bottom"
        >
            <StateTagCls
                {...props}
            />
        </Tooltip>
    )
}

const QuestionPopover = ({ title }: any) => (
    <Popover
        title={title}
        placement="right"
        trigger="hover"
        overlayClassName={styles["tag_popover_style"]}
    >
        <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)', verticalAlign: 'middle' }} />
    </Popover>
)


const CustomStateTag: React.FC = (props: any) => {
    const { state } = props
    return (
        <RenderStateTag
            {...props}
            color={getStateColor(state)}
            style={!stateColorMap.get(state) && { color: "#1d1d1d" }}
        >
            {state === 'success' ? 'complete' : state}
        </RenderStateTag>
    )
}

const CustomTooltipStateTag: React.FC<any> = (props) => {
    const { state } = props
    return (
        <TooltipStateTag
            {...props}
            color={getStateColor(state)}
            style={!stateColorMap.get(state) && { color: "#1d1d1d" }}
        >
            {state === 'success' ? 'complete' : state}
        </TooltipStateTag>
    )
}


export const JobListStateTag: React.FC<any> = (props) => {
    const { state, run_state = '', state_desc } = props
    const { ws_id }: any = useParams()
    if (state === 'running') {
        if (run_state)
            return (
                <Space>
                    <CustomStateTag {...props}>{state}</CustomStateTag>
                    <QuestionPopover title={'未分配到测试机器'} />
                </Space>
            )
        return (
            <Space>
                <CustomStateTag {...props}>{state}</CustomStateTag>
                <QuestionPopover title={'正在运行中，请耐心等待'} />
            </Space>
        )
    }

    if (state === 'pending' && state_desc) {
        return (
            <Space>
                <CustomStateTag {...props}>{state}</CustomStateTag>
                <QuestionPopover
                    title={
                        <span dangerouslySetInnerHTML={{
                            __html: state_desc.replace(/(\d+)/g, `<a href="/ws/${ws_id}/test_result/$1" target="_blank">$1</a>`)
                        }}
                        />
                    }
                />
            </Space>
        )
    }

    return <CustomStateTag {...props} />
}

const stateColorMap = new Map([
    ['success', '#81BF84'],
    ['pass', '#81BF84'],
    ['running', '#649FF6'],
    ['fail', '#C84C5A'],
])

const getStateColor = (state: string) => stateColorMap.get(state) || '#D9D9D9'

export const StateTag: React.FC<any> = (props) => {
    return <CustomTooltipStateTag {...props} no_margin={1} />
}

interface QuestionTootipProp {
    title: string | React.ReactNode;
    desc: string | React.ReactNode;
    placement?: any;
}

export const QusetionIconTootip: React.FC<QuestionTootipProp> = ({ title, desc, placement = 'bottom' }) => (
    <Space>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{title}</span>
        <Tooltip
            overlayClassName={styles.table_question_tooltip}
            placement={placement}
            arrowPointAtCenter
            title={desc}
            color="#fff"
        >
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />
        </Tooltip>
    </Space>
)

export const ResultTdPopver: React.FC<any> = (
    {
        title,
        test_value,
        value_list,
        cv_value,
        max_value,
        min_value,
        metric,
        result,
        rowkey
    }
) => {
    const id = `copyColumnTd${rowkey || ''}`
    useEffect(() => {
        const clipboard = new Clipboard('#' + id)
        clipboard.on('success', function (e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard && clipboard.destroy()
        }
    }, [])

    const fixedNum = (num: any) => num ? new Number(num).toFixed(2) : null

    const max = fixedNum(max_value)
    const min = fixedNum(min_value)
    const cv = cv_value
    const test = fixedNum(test_value)
    const list = value_list.map((i: any) => fixedNum(i))

    let copyText = `${metric} ${title}:
Avg: ${test}
CV:  ${cv}`
    copyText += max ? `\nMax: ${max}` : ''
    copyText += min ? `\nMin: ${min}` : ''
    copyText += list.length ? '\nTest Record\n' : ''
    copyText += list.reduce((pre: any, cur: any, index: number) => pre.concat(`(${index + 1}) ${cur}\n`), '')

    const spanText = `${test}±${cv}`

    const resultSpan = () => {
        if (result === 'decline')
            return <span className={styles.result_popover_span} style={{ color: '#C84C5A' }}>{spanText}</span>
        if (result === 'increase')
            return <span className={styles.result_popover_span} style={{ color: '#81BF84' }}>{spanText}</span>
        return <span className={styles.result_popover_span} style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{spanText}</span>
    }

    return (
        <Popover
            overlayClassName={styles.metric_list_copy}
            title={
                <Row justify="space-between">
                    <b>{title}</b>
                    <span
                        id={id}
                        style={{ color: '#1890FF', cursor: 'pointer' }}
                        data-clipboard-text={copyText}
                    >
                        复制
                    </span>
                </Row>
            }
            content={
                <>
                    <Row><b>Avg：</b><span>{test}</span></Row>
                    <Row><b>CV：</b><span>{cv}</span></Row>
                    <Row><b>Max：</b><span>{max}</span></Row>
                    <Row><b>Min：</b><span>{min}</span></Row>
                    {list.length > 0 && <Row style={{ marginTop: 16 }}><b>Test Record</b></Row>}
                    {
                        list.map(
                            (i: any, index: number) => (
                                <Row key={index}>{`(${index + 1})${i}`}</Row>
                            )
                        )
                    }
                </>
            }
        >
            {resultSpan()}
        </Popover>
    )
}