import React, { memo, useRef } from 'react'
import { Row, Space, Typography, Select, Button } from 'antd'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import styled from 'styled-components'
import { CaretRightOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as GroupIcon } from '@/assets/svg/TestReport/TestGroup.svg'
import { ReactComponent as TermIcon } from '@/assets/svg/TestReport/TestItem.svg'
import { useRefWidth } from '../../hooks'

const FullRow = styled(Row)`width:100%;`
const AlignItems = `align-items:center;`
const TitlePadding = `padding:0 20px;`

const Wrapper = styled(Row)`

`

const CaseTable = styled(FullRow)`

`

const CaseConfHeader = styled(FullRow)`
    height:33px;
    align-items:flex-end;
    &>div {
        padding:0 8px;
        font-size: 12px;
        color: rgba(0,0,0,0.45);
    }
    &>div:first-child {
        width:359px;
    }
    &>div:nth-child(n+2){
        width:calc( ( 100% - 359px ) / 3 );
    }
`
const FontText = styled(Typography.Text)`
    color:rgba(0,0,0,0.45);
`
const Term = styled(FullRow)`
    margin-bottom:20px;
    border:1px solid rgba(0,0,0,0.1);
`
const TermTitle = styled(FullRow)`
    background: rgba(0,0,0,0.02);
    min-height: 48px;
    ${AlignItems}
    padding: 8px 20px;
`

const Suite = styled(FullRow)`
    margin-bottom:16px;
`

const TermBody = styled(FullRow)`
    padding:16px;
    background:#fff;
    & ${Suite}:last-child  {
        margin-bottom:0;
    }
`

const SuiteTitle = styled(FullRow)`
    ${TitlePadding}
    ${AlignItems}
    min-height:40px;
    padding-top:8px;
    padding-bottom:8px;
    background: rgba(0,0,0,0.04);
`

const SuiteBody = styled(FullRow)`
    padding:0 16px 16px;
    background: rgba(0,0,0,0.02);
`

const ConfRow = styled(FullRow)`
    height:40px;
    border: 1px solid #EBEBEB;
    margin-bottom:8px;
    border-radius: 2px;
    background: #FAFAFA;
    ${AlignItems}

    .anticon-caret-right,
    .anticon-caret-down { 
        // cursor:pointer ; 
        color:rgba(0,0,0,.25);
    }

    &>div {
        padding:8px;
        border-right:1px solid #EBEBEB;
    }
    &>div:first-child {
        width:359px;
    }
    &>div:nth-child(n+2){
        width:calc( ( 100% - 359px ) / 3 );
        padding-top:0;
        padding-bottom:0;
        span {
            font-size:20px;
        }
        & .ant-space-item:first-child  span {
            color:#649FF6;
        }
        & .ant-space-item:nth-child(2)  span {
            color:#81BF84;
        }
        & .ant-space-item:last-child  span {
            color:#C84C5A;
        }
    }
    &>div:last-child {
        border-right:none;
    }
`

const Group = styled(FullRow)`
    border:1px solid #EBEBEB;
    margin-bottom:20px;
`

const GroupTitle = styled(FullRow)`
    min-height:48px;
    background: rgba(0,0,0,0.02);
    ${AlignItems}
    ${TitlePadding}
`

const GroupBody = styled(FullRow)`
    padding:0 16px 16px;
    background:#ffffff;
    ${Term} {
        border : none;
        margin-bottom:0px;
    }
    ${TermTitle} {
        padding : 0;
        background:#fff;
        height: 56px;
    } 
    ${TermBody} {
        padding:0;
    }
`

const TermItem: React.FC<any> = ({ name, list, rowkey, field }) => {
    const enLocale = getLocale() === 'en-US'
    // const allCaseKeys = list.reduce((pre: any, cur: any) => pre.concat(cur.case_source.map(({ test_conf_id }: any) => test_conf_id)), [])

    // const [expandedKeys, setExpandedKeys] = useState<Array<number>>([])

    // const hanldeExpand = (key: number) => {
    //     const hasKeys = expandedKeys.includes(key)
    //     if (!hasKeys)
    //         setExpandedKeys(expandedKeys.concat(key))
    //     else
    //         setExpandedKeys(expandedKeys.filter(i => i !== key))
    // }

    const handleOpenAll = () => {
        return false
        /* expandedKeys.length === allCaseKeys.length ?
            setExpandedKeys([]) :
            setExpandedKeys(allCaseKeys) */
    }

    const title = useRef<any>()
    const titleWidth = useRefWidth(title)

    return (
        <Term >
            <TermTitle justify="space-between" id={`${field}-${rowkey}`} ref={title}>
                <Space align="start">
                    <TermIcon style={{ transform: 'translate(0px, 2px)' }} />
                    <Typography.Text strong style={{ width: titleWidth - 410 - 30, display: 'inline-block' }}>{name}</Typography.Text>
                </Space>
                <Space >
                    <Typography.Text><FormattedMessage id="report.filter"/>：</Typography.Text>
                    <Select value={''} style={{ width: 200 }}>
                        <Select.Option value=""><FormattedMessage id="report.all.s"/></Select.Option>
                    </Select>
                    <Button onClick={handleOpenAll} disabled={true}>
                        {/* {
                            expandedKeys.length === allCaseKeys.length ? '收起所有' : '展开所有'
                        } */}
                        <FormattedMessage id="report.btn.collapse.all"/>
                    </Button>
                </Space>
            </TermTitle>
            <TermBody>
                {
                    list.map((suite: any, index: number) => (
                        <Suite key={index}>
                            <SuiteTitle>
                                <Typography.Text strong ellipsis>{suite.suite_show_name}</Typography.Text>
                            </SuiteTitle>
                            <SuiteBody>
                                <CaseConfHeader >
                                    <Row>Conf</Row>
                                    <Row>
                                        <FormattedMessage id="report.total/pass/fail"/>
                                    </Row>
                                    <Row justify="space-between">
                                        <FontText><FormattedMessage id="report.total/pass/fail"/></FontText>
                                        <Space style={{ color:'rgba(0,0,0,0.45)'}} size={enLocale? 4: 8}>
                                            <FontText><FormattedMessage id="report.comparison.results"/></FontText>
                                            <IconArrow />
                                            <QuestionCircleOutlined style={{ color:'rgba(0,0,0,0.45)'}}/>
                                        </Space>
                                    </Row>
                                    <Row justify="space-between">
                                        <FontText><FormattedMessage id="report.total/pass/fail"/></FontText>
                                        <Space size={enLocale? 4: 8}>
                                            <FontText><FormattedMessage id="report.comparison.results"/></FontText>
                                            <IconArrow />
                                            <QuestionCircleOutlined style={{ color:'rgba(0,0,0,0.45)'}}/>
                                        </Space>
                                    </Row>
                                </CaseConfHeader>
                                {
                                    suite.case_source.map((conf: any, idx: number) => (
                                        <CaseTable key={idx}>
                                            <ConfRow >
                                                <div>
                                                    <Space>
                                                        {/* <span onClick={() => hanldeExpand(conf.test_conf_id)}> */}
                                                        <span>
                                                            {
                                                                /* expandedKeys.includes(conf.test_conf_id) ?
                                                                    <CaretDownOutlined /> : */
                                                                <CaretRightOutlined />
                                                            }
                                                        </span>
                                                        <Typography.Text style={{ width: 325 }} ellipsis strong>{conf.test_conf_name}</Typography.Text>
                                                    </Space>
                                                </div>
                                                <div><Space><span>-</span><span>-</span><span>-</span></Space></div>
                                                <div><Space><span>-</span><span>-</span><span>-</span></Space></div>
                                                <div><Space><span>-</span><span>-</span><span>-</span></Space></div>
                                            </ConfRow>
                                        </CaseTable>
                                    ))
                                }
                            </SuiteBody>
                        </Suite>
                    ))
                }
            </TermBody>
        </Term>
    )
}

const FunctionalTest: React.FC<any> = ({ func_item, field }) => {

    const title = useRef<any>()
    const titleWidth = useRefWidth(title)

    return (
        <Wrapper>
            {
                func_item.map(
                    (item: any, index: number) => (
                        item.is_group ?
                            <Group key={index} id={`${field}-${item.rowkey}`} ref={title}>
                                <GroupTitle>
                                    <GroupIcon style={{ transform: 'translate(0px, 1px)', marginRight: 8 }} />
                                    <Typography.Text strong style={{ width: titleWidth - 70, display: 'inline-block' }}>{item.name}</Typography.Text>
                                </GroupTitle>
                                <GroupBody>
                                    {
                                        item.list.map(
                                            (i: any, idx: number) => (
                                                <TermItem key={idx} {...i} field={field} />
                                            )
                                        )
                                    }
                                </GroupBody>
                            </Group> :
                            <TermItem key={index} {...item} field={field} />
                    )
                )
            }
        </Wrapper>
    )
}

export default memo(FunctionalTest)