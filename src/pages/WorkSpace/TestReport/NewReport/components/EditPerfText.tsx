/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-shadow */
import { useEffect, useState } from 'react';
import { Typography, Input, notification, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useIntl, Access, useAccess, useLocation, useParams } from 'umi';
import { AccessTootip } from '@/utils/utils';
import styled from 'styled-components';
import _ from 'lodash';
import { saveReportDesc } from '../../services';
const { TextArea } = Input;

const TextAreaWarrper = styled(TextArea)`
    width: 100%;
`
export const PerfTextArea = ({
    name,
    field,
    suite,
    style,
    space = '0px',
    fontStyle = {
        fontSize: 14,
        fontFamily: 'PingFangSC-Regular',
        color: 'rgba(0,0,0,0.65)',
        whiteSpace: 'pre-wrap',
    },
    defaultHolder,
    creator
}:
    {
        name: string;
        field: string;
        suite: any;
        style?: any;
        space?: string;
        fontStyle?: any;
        defaultHolder?: string;
        creator?: any;
    }) => {
    const { report_id } = useParams() as any
    const access = useAccess();
    const { pathname } = useLocation()
    const { formatMessage } = useIntl()
    const [btn, setBtn] = useState(false)
    const [title, setTitle] = useState(name || '')

    /* useEffect(() => {
        setTitle(name)
    }, [name]) */

    const openNotification = (name: string, field: string) => {
        notification['success']({
            message: `${name}：${field}`,
            placement: 'bottomRight'
        });
    };

    const changeName = (name: any) => {
        const list = {
            test_env: formatMessage({ id: 'report.test_env.save' }),
            test_description: formatMessage({ id: 'report.test_description.save' }),
            test_conclusion: formatMessage({ id: 'report.test_conclusion.save' }),
        }
        return (list as any)[name];
    }

    const handleBlur = async () => {
        const { item_suite_id, suite_name } = suite
        const obj: any = {
            item_suite_id,
            report_id,
        }
        obj[field] = title
        const { code, msg } = await saveReportDesc(obj)
        if (code === 200) {
            openNotification(suite_name, changeName(field))
            setBtn(false)
        } else {
            message.error(msg)
        }
    }

    const handleChange = (title: any) => {
        if (_.isNull(title) || _.isUndefined(title)) return formatMessage({ id: 'report.not.filled.in' })
        return title || '-'
    }

    if (!!~pathname.indexOf("/test_create_report"))
        return (
            <div style={{ width: '100%', ...style }}>
                <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
            </div>
        )

    if (btn) {
        return (
            <div style={{ marginBottom: space }}>
                <TextAreaWarrper
                    autoComplete="off"
                    size="small"
                    placeholder={defaultHolder}
                    style={{ padding: '10px', ...fontStyle }}
                    value={title}
                    onChange={evt => setTitle(evt.target.value)}
                    onBlur={handleBlur}
                />
            </div>
        )
    }
    return (
        <div style={{ width: '100%', ...style }}>
            <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
            <Access accessible={access.WsTourist()}>
                <Access
                    accessible={access.WsMemberOperateSelf(creator)}
                    fallback={
                        <EditOutlined onClick={() => AccessTootip()} style={{ paddingLeft: 10 }} />
                    }
                >
                    <EditOutlined style={{ paddingLeft: 10 }} onClick={() => setBtn(true)} />
                </Access>
            </Access>
        </div>
    )
}

export const GroupItemText = ({
    name,
    rowKey,
    btn = false,
    dataSource,
    setDataSource,
    defaultHolder,
}:
    {
        name: string,
        rowKey: any,
        btn: boolean,
        dataSource: any,
        setDataSource: any,
        defaultHolder?: string,

    }) => {
    const { formatMessage } = useIntl()
    const [title, setTitle] = useState('')

    useEffect(() => {
        setTitle(name)
    }, [name])

    const handleBlur = () => {
        setDataSource(dataSource.map((ele: any) => {
            if (ele.is_group) {
                if (ele.rowKey == rowKey) {
                    ele.name = title
                }
                const list = ele.list.map((l: any) => {
                    if (l.rowKey == rowKey) {
                        l.name = title
                    }
                    return {
                        ...l,
                    }
                })
                return {
                    ...ele,
                    list
                }
            } else {
                if (ele.rowKey == rowKey) {
                    ele.name = title
                }
                return {
                    ...ele,
                }
            }
        }))
    }
    const fontStyle = {
        fontSize: 14,
        fontFamily: 'PingFangSC-Medium',
        color: 'rgba(0,0,0,0.85)'
    }
    const handleChange = (title: any) => {
        if (_.isNull(title) || _.isUndefined(title)) return formatMessage({ id: 'report.not.filled.in' })
        return title
    }

    return (
        <>
            {
                btn ?
                    <Input
                        autoComplete="off"
                        size="small"
                        placeholder={defaultHolder}
                        style={{ padding: '6px 8px 6px 8px', width: '93%', ...fontStyle }}
                        value={title}
                        onChange={evt => setTitle(evt.target.value)}
                        onBlur={handleBlur}
                    />
                    :
                    <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
            }
        </>
    )
}