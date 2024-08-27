/* eslint-disable react-hooks/exhaustive-deps */
import { Select, Form, Tag, Input, Typography, Space } from 'antd';
import { queryDispatchTags } from './services';
import React, { useEffect, useState } from 'react';
import { useParams, useIntl, FormattedMessage } from 'umi';
import { tagRender } from '../untils';
import { useDrawerProvider } from './Provider';

const DispathTagSelect: React.FC = () => {
    const { formatMessage } = useIntl();
    const { serverObjectType, run_mode, server_type } = useDrawerProvider();

    const { ws_id } = useParams<any>();
    const [tagList, setTagList] = React.useState([]);

    const form = Form.useFormInstance();
    const server_tag_id = Form.useWatch('server_tag_id', form);

    const PAGE_SIZE = 100;

    const [tagPageNum, setTagPageNum] = useState(1);
    const [fetching, setFetching] = useState(true);
    const [totalPage, setTotalPage] = useState(1);

    const [err, setErr] = React.useState(false);

    const dispatchRequest = async (page_num = 1) => {
        setFetching(true);
        const { data, code, total_page } = await queryDispatchTags({
            ws_id,
            run_mode,
            page_num,
            run_environment: server_type,
            page_size: PAGE_SIZE,
        });
        setFetching(false);
        if (code === 200 && data) {
            setTagList((p: any) =>
                data.reduce((pre: any, cur: any) => {
                    const ids = p.map(({ id }: any) => id);
                    if (ids.includes(cur.id)) return pre;
                    return pre.concat(cur);
                }, []),
            );
            setTotalPage(total_page);
        }
    };

    useEffect(() => {
        if (serverObjectType === 'server_tag_id') {
            setTagList([]);
            dispatchRequest(1);
            setTagPageNum(1);
        }
    }, [serverObjectType]);

    const handleTagePopupScroll = ({ target }: any) => {
        //tag
        const { clientHeight, scrollHeight, scrollTop } = target;
        if (clientHeight + scrollTop === scrollHeight) {
            const num = tagPageNum + 1;
            if (num <= totalPage) {
                setTagPageNum(num);
                dispatchRequest(num);
            }
        }
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Select
                // title={formatMessage({id: 'select.suite.server_tag_id.message'})}
                placeholder={<FormattedMessage id="select.suite.server_tag_id.message" />}
                style={{ width: '100%' }}
                allowClear
                filterOption={(input, option) =>
                    (option?.name ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(vals, opts: any) => {
                    setErr(false);
                    form.setFieldsValue({
                        server_tag_id: opts
                            ?.filter((ctx: any) => !!ctx.id)
                            ?.map((ctx: any) => ({
                                id: ctx.value,
                                name: ctx.name,
                                color: ctx.color,
                            })),
                    });
                }}
                value={server_tag_id?.map((ctx: any) => ctx.id)}
                tagRender={tagRender}
                mode="multiple"
                loading={fetching}
                onPopupScroll={handleTagePopupScroll}
                getPopupContainer={(node) => node.parentNode}
                options={tagList?.map((i: any) => ({
                    ...i,
                    value: i.id,
                    label: <Tag color={i.tag_color}>{i.name}</Tag>,
                    color: i.tag_color,
                }))}
            />
            {err && (
                <Typography.Text type="danger">
                    {formatMessage({ id: 'select.suite.server_tag_id.message' })}
                </Typography.Text>
            )}
            <Form.Item noStyle hidden>
                <Form.List
                    name="server_tag_id"
                    rules={[
                        {
                            validator(rules, value) {
                                if (!value?.length) {
                                    setErr(true);
                                    return Promise.reject();
                                }
                                setErr(false);
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }) =>
                        fields.map((ctx: any) => (
                            <Form.Item key={ctx.key} {...ctx}>
                                <Input />
                            </Form.Item>
                        ))
                    }
                </Form.List>
            </Form.Item>
        </Space>
    );
};

export default DispathTagSelect;
