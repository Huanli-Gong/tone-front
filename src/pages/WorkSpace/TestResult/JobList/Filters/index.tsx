import React from "react"
import { Col, Row, Space, Typography, Divider, DatePicker, Button, message } from "antd"
import FilterItem from "./Item"
import { columns } from "./columns"
import moment from "moment"
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import Clipboard from "clipboard"
import { stringify } from "querystring"
import { useLocation, useIntl, FormattedMessage } from "umi"
import { transQuery } from "../utils"

const TimerPick: React.FC = (props) => (
    <DatePicker.RangePicker
        {...props}
        size="middle"
        showTime={{ format: 'HH:mm:ss' }}
        disabledDate={
            (current: any) => {
                return moment().isBefore(current, 'days')
            }
        }
        format="YYYY-MM-DD HH:mm:ss"
    />
)

type IProps = {
    onChange?: (val: any) => void;
    columns?: any[];
    defaultValue?: any[];
    onClearn?: () => void;
    wrapperCol?: number;
    pageQuery?: any
}

const format = ('YYYY-MM-DD HH:mm:ss')
const INITIAL_STATE_TIME = [
    '',
    moment(moment().hours(23).minutes(59).seconds(59), 'YYYY-MM-DD HH:mm:ss')
]

const RIGHT_FILTER = [{ name: "creation_time", value: INITIAL_STATE_TIME }]
const LEFT_FILTER = [{ name: "job_id", value: "" }]

const transTime = (str: string) => {
    if (!str) return
    try {
        const realTime = JSON.parse(str)
        if (!realTime) return
        const { start_time, end_time } = realTime
        return [
            moment(start_time),
            moment(end_time)
        ]
    }
    catch (err) {
        console.log(err)
        return undefined
    }
}

const FilterForm: React.FC<IProps> = (props) => {
    const { formatMessage } = useIntl()
    const { onChange, pageQuery } = props

    const { query } = useLocation() as any

    const [values, setValues] = React.useState<any>(undefined)
    const [left, setLeft] = React.useState({})
    const [right, setRight] = React.useState({})

    const handleLeftChange = (vals: any) => {
        const result = Object.entries(vals).reduce((pre: any, cur: any) => {
            const [name, value] = cur;
            if (["creators", "tags", "test_suite"].includes(name)) {
                if (value && value.length === 0) {
                    pre[name] = undefined
                    return pre
                };
            }
            pre[name] = value;
            return pre
        }, {})
        setLeft(result)
    }

    const handleRightChange = (vals: any) => {
        const json = Object.entries((vals)).reduce((pre: any, cur: any) => {
            const [name, val] = cur
            if (!val) return pre
            const [start_time, end_time] = val
            pre[name] = {
                start_time: moment(start_time).format(format),
                end_time: moment(end_time).format(format)
            }
            return pre
        }, {})
        setRight(json)
    }

    const timeRef = React.useRef(null) as any
    const domRef = React.useRef(null) as any

    const reset = () => {
        timeRef.current?.reset(RIGHT_FILTER)
        domRef.current?.reset(LEFT_FILTER)
        setLeft({})
        setRight({})
    }

    const copy = () => {
        const dom = document.createElement("a")
        dom.style.width = "0px";
        dom.style.height = "0px"
        document.body.appendChild(dom)

        const t = transQuery(pageQuery)
        const text = location.origin + location.pathname + "?" + stringify(t)
        const cp = new Clipboard(dom, {
            text: () => text
        })
        cp.on("success", () => {
            message.success(formatMessage({ id: 'ws.result.details.copied'}) )
        })
        dom.click()
        cp.destroy()
        document.body.removeChild(dom)
    }

    React.useEffect(() => {
        setValues(Object.assign(left, right))
    }, [left, right])

    const queryValue = React.useMemo(() => {
        const { ws_id, page_size, page_num, tab, ...rest } = query
        const { completion_time, creation_time, ...leftValues } = rest

        const transObj = (vals: any) => {
            const v = Object.keys(vals).filter((k: any) => !!vals[k]).map((name) => {
                if (!vals[name]) return { name, value: undefined }

                if (["project_id", "job_type_id"].includes(name)) {
                    return { name, value: + vals[name] }
                }

                if (["creators", "test_suite", "tags"].includes(name)) {
                    return { name, value: JSON.parse(vals[name]).map((i: any) => +i) }
                }

                return ({
                    name,
                    value: vals[name]
                })
            })
            return v
        }

        const r = transObj({
            completion_time: transTime(completion_time),
            creation_time: transTime(creation_time)
        })
        const l = transObj(leftValues)

        setLeft(leftValues)
        setRight({ completion_time, creation_time })
        return { r, l }
    }, [query])

    const { r, l } = queryValue

    return (
        <div style={{ padding: "0 16px" }}>
            <Divider style={{ margin: "0 0 16px" }} />
            <Row gutter={12}>
                <Col span={12}>
                    <FilterItem
                        ref={domRef}
                        title={formatMessage({ id: 'ws.result.list.select.condition'})}
                        columns={
                            columns.map((item: any)=>
                              ({
                                ...item,
                                placeholder: formatMessage({ id: `ws.result.list.please.placeholder.${item.name}`}),
                              })
                            )
                        }
                        defaultValue={l.length ? l : LEFT_FILTER}
                        onChange={handleLeftChange}
                    />
                </Col>
                <Col span={12}>
                    <FilterItem
                        ref={timeRef}
                        title={formatMessage({ id: 'ws.result.list.select.time'})}
                        columns={[
                            {
                                label: <FormattedMessage id="ws.result.list.start_time" />,
                                name: 'creation_time',
                                render: <TimerPick />
                            },
                            {
                                label: <FormattedMessage id="ws.result.list.completion_time" />,
                                name: 'completion_time',
                                render: <TimerPick />
                            }
                        ]}
                        defaultValue={r.length ? r : RIGHT_FILTER}
                        onChange={handleRightChange}
                    />
                </Col>
            </Row>
            <Divider style={{ margin: "16px 0 0" }} dashed />
            <Row style={{ marginTop: 12, marginBottom: 12 }}>
                <Col span={12}>
                    <Space style={{ paddingLeft: 65 }}>
                        <Button type="primary" onClick={() => onChange && onChange(values)}><FormattedMessage id="operation.filter"/></Button>
                        <Button onClick={reset}><FormattedMessage id="operation.reset"/></Button>
                        <Typography.Link onClick={copy}>
                            <Space size={4}>
                                <CopyLink />
                                <Typography.Text><FormattedMessage id="operation.share"/></Typography.Text>
                            </Space>
                        </Typography.Link>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default FilterForm