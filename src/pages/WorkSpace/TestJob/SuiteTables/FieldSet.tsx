import { Form, Input, Select, Spin, Tag, Space, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { useIntl, useParams } from 'umi';
import { tagRender } from '../components/untils';
import { queryDispatchTags } from '../components/SelectSuite/service';
import { useTestJobContext } from '../provider';
import OverflowList from '@/components/TagOverflow';
import { useSuiteTableContext } from './provider';

const SuiteName = styled.div`
    display: flex;
    width: 100%;
    flex-direction: row;
    gap: 8px;

    .suite-name-div {
        max-width: 100%;
    }

    .case-selected-count {
        flex-shrink: 0;
        padding: 2px 6px;
        background-color: #f0f0f0;
        border-radius: 10px;
        font-size: 12px;
        color: #595959;
    }
`;

const ServerColumn: React.FC<any> = (props) => {
    const { jobTypeDetails } = useTestJobContext();
    const { server_type } = jobTypeDetails;
    const { run_mode } = useSuiteTableContext();

    const {
        server_radio_type,
        server_select_type,
        custom_ip,
        custom_channel,
        ip,
        server_tag_id,
        is_instance,
    } = props || {};

    if (!server_radio_type && !server_select_type)
        return (
            <Tag color={'#E5EBFC'} style={{ border: 'none', color: '#3354DA', fontWeight: 500 }}>
                随机
            </Tag>
        );

    if (server_select_type === 'random')
        return (
            <Tag color={'#E5EBFC'} style={{ border: 'none', color: '#3354DA', fontWeight: 500 }}>
                随机
            </Tag>
        );
    if (['server_object_id', 'setting', 'instance'].includes(server_select_type)) {
        if (
            server_type === 'aliyun' &&
            run_mode === 'standalone' &&
            Object.prototype.toString.call(is_instance) === '[object Number]'
        ) {
            const str = is_instance ? `（机器实例）` : `（云上配置）`;
            return (
                <Typography.Text ellipsis>
                    <Tag
                        color={'#E6F9F0'}
                        style={{
                            border: 'none',
                            display: 'inline-flex',
                            width: '100%',
                        }}
                    >
                        <Typography.Text
                            ellipsis={{ tooltip: `${ip}${str}` }}
                            style={{
                                width: '100%',
                                color: '#47885E',
                                display: 'inline-block',
                                fontWeight: 500,
                            }}
                        >
                            {ip}
                        </Typography.Text>
                        <Typography.Text
                            style={{ flexShrink: 0, color: '#47885E', fontWeight: 500 }}
                        >
                            {str}
                        </Typography.Text>
                    </Tag>
                </Typography.Text>
            );
        }
        return (
            <Tag color={'#E6F9F0'} style={{ border: 'none', color: '#47885E', fontWeight: 500 }}>
                {ip}
            </Tag>
        );
    }
    if (server_radio_type !== 'pool') {
        return (
            <Tag color={'#FAF1E4'} style={{ border: 'none', color: '#C56336', fontWeight: 500 }}>
                {`${custom_ip} (${custom_channel})`}
            </Tag>
        );
    }
    return (
        <OverflowList
            list={server_tag_id.map((ctx: any) => (
                <Tag id={ctx.name}>{ctx.name}</Tag>
            ))}
        />
    );
};

export const getServerColumn: any = () => ({
    title: '机器',
    width: 400,
    ellipsis: true,
    render(record: any) {
        return <ServerColumn {...record} />;
    },
});

export const getSuiteNameColumn: any = (selectedkeys: any) => ({
    title: 'Test Suite名称',
    ellipsis: true,
    render(row: any) {
        const selectedRow = selectedkeys.find((ctx: any) => ctx.id === row.id);
        return (
            <SuiteName>
                <div className="suite-name-div">{row.name}</div>
                <div className="case-selected-count">{`${
                    selectedRow?.test_case_list?.length || 0
                }/${row.test_case_list?.length || 0}`}</div>
            </SuiteName>
        );
    },
});

export const DispathTagSelect: React.FC = () => {
    const { formatMessage } = useIntl();
    const { jobTypeDetails } = useTestJobContext();
    const { run_mode } = useSuiteTableContext();
    const { server_type } = jobTypeDetails;

    const form = Form.useFormInstance();
    const server_tag_id = Form.useWatch('server_tag_id', form);

    const { ws_id } = useParams<any>();
    const PAGE_SIZE = 100;

    const [pageNum, setPageNum] = React.useState(1);
    const [fetching, setFetching] = React.useState(true);
    const [totalPage, setTotalPage] = React.useState(1);
    const [tagList, setTagList] = React.useState([]);
    const [err, setErr] = React.useState(false);

    const init = async (page_num = 1) => {
        setFetching(true);
        const { data, code, total_page } = await queryDispatchTags({
            ws_id,
            run_mode,
            page_num,
            run_environment: server_type,
            page_size: PAGE_SIZE,
        });
        setFetching(false);

        if (code !== 200) {
            return;
        }

        setTagList(tagList.concat(data));
        setTotalPage(total_page);
    };

    React.useEffect(() => {
        init();
        return () => {
            setTagList([]);
        };
    }, []);

    //tag
    const handleTagePopupScroll = ({ target }: any) => {
        const { clientHeight, scrollHeight, scrollTop } = target;
        if (clientHeight + scrollTop === scrollHeight) {
            const num = pageNum + 1;
            if (num <= totalPage) {
                setPageNum(num);
                init(num);
            }
        }
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Select
                placeholder={formatMessage({ id: 'select.suite.server_tag_id.message' })}
                style={{ width: '100%' }}
                allowClear
                filterOption={(input, option) =>
                    (option?.name ?? '').toLowerCase().includes(input.toLowerCase())
                }
                tagRender={tagRender}
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
                mode="multiple"
                loading={fetching}
                notFoundContent={fetching ? <Spin /> : null}
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

            <Form.Item hidden noStyle>
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

const LineHeadBox = styled.div`
    width: 100%;
    height: 39px;
`;

const LineBox = styled(LineHeadBox)`
    position: relative;
    &::after {
        content: '';
        width: 24px;
        height: 1px;
        position: absolute;
        left: 18px;
        top: 50%;
        background-color: #bfbfbf;
    }
`;

const CaseTableWrapperCls = styled.div`
    display: flex;
    flex-direction: row;
    background-color: #f4f5fb;
    padding: 8px 8px 8px 0;

    .left-line-box {
        width: 50px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            top: 1px;
            left: 18px;
            width: 1px;
            height: calc(100% - 39px / 2);
            background-color: #bfbfbf;
        }
    }

    .case-right-table {
        width: 100%;
    }

    .ant-table-tbody .ant-table-row.ant-table-row-level-0:last-child {
        td {
            border-bottom: none;
        }
    }
`;
export const CaseTableWrapper: React.FC<any> = ({ list, children, filterIds }) => {
    return (
        <CaseTableWrapperCls>
            <div className="left-line-box">
                <LineHeadBox />
                {list?.map((ctx: any) => (
                    <LineBox
                        key={ctx.id}
                        className={!filterIds?.includes(ctx.id) ? 'row-hidden-cls' : ''}
                    />
                ))}
            </div>
            {children}
        </CaseTableWrapperCls>
    );
};
