import React from 'react';
import { Tooltip, Tag, Typography } from 'antd';
import { useIntl } from 'umi';
import { ReactComponent as Var } from '@/assets/svg/test_job_var.svg';
import { isNull } from 'lodash';
import OverflowList from '@/components/TagOverflow';
import { useTestJobContext } from '../../provider';

export const ServerColumn: React.FC<any> = (props) => {
    const { server_tag_id, ip, customer_server, is_instance, run_mode } = props;
    const { jobTypeDetails } = useTestJobContext();
    const { server_type } = jobTypeDetails;

    const { formatMessage } = useIntl();
    const random = formatMessage({ id: 'select.suite.random' });

    if (server_tag_id?.length > 0) {
        return (
            <OverflowList
                list={server_tag_id?.map((t: any) => (
                    <Tag key={t.id}>{t.name}</Tag>
                ))}
            />
        );
    }

    if (isNull(ip) && customer_server && JSON.stringify(customer_server) !== '{}') {
        const { custom_ip, custom_channel } = customer_server;
        return (
            <Tag color={'#FAF1E4'} style={{ border: 'none', color: '#C56336', fontWeight: 500 }}>
                {`${custom_ip} (${custom_channel})`}
            </Tag>
        );
    }

    if (ip && !['随机'].includes(ip)) {
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
                            maxWidth: '100%',
                        }}
                    >
                        <Typography.Text
                            ellipsis={{ tooltip: `${ip}${str}` }}
                            style={{
                                maxWidth: '100%',
                                color: '#47885E',
                                display: 'inline-block',
                                fontWeight: 500,
                            }}
                        >
                            {ip}
                        </Typography.Text>
                        <Typography.Text
                            style={{ flexShrink: 0, color: '47885E', fontWeight: 500 }}
                        >
                            {str}
                        </Typography.Text>
                    </Tag>
                </Typography.Text>
            );
        }
        return (
            <Tag
                color={'#E6F9F0'}
                style={{
                    border: 'none',
                }}
            >
                <Typography.Text
                    ellipsis
                    style={{ color: '#47885E', display: 'inline-block', fontWeight: 500 }}
                >
                    {ip}
                </Typography.Text>
            </Tag>
        );
    }
    return (
        <Tag
            style={{
                color: '#3354DA',
                backgroundColor: '#E5EBFC',
                fontWeight: 500,
                border: 'none',
            }}
        >
            {random}
        </Tag>
    );
};
export const ScriptColumn: React.FC<{ setup_info: any; cleanup_info: any }> = ({
    setup_info,
    cleanup_info,
}) => {
    const { formatMessage } = useIntl();
    const beforeStart = formatMessage({ id: 'select.suite.before.restart' });
    const afterStart = formatMessage({ id: 'select.suite.after.restart' });
    const scriptStr =
        setup_info || cleanup_info
            ? `${beforeStart}:${setup_info || '-'}，${afterStart}:${cleanup_info || '-'}`
            : undefined;
    return (
        <Tooltip title={scriptStr} color="#fff" overlayInnerStyle={{ color: 'rgba(0,0,0,.85)' }}>
            <Tag
                style={{
                    backgroundColor: '#F5F5F5',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                }}
            >
                脚本：{scriptStr ? <Var /> : '-'}
            </Tag>
        </Tooltip>
    );
};

export const VarColumn: React.FC<any> = (props) => {
    const { env_info } = props;
    let str = undefined;

    if (env_info?.length) {
        str = env_info
            ?.map((item: any) => (item.name ? `${item.name || ''}=${item.val || ''};` : undefined))
            .filter(Boolean);
    }

    return (
        <Tooltip title={str} color="#fff" overlayInnerStyle={{ color: 'rgba(0,0,0,.85)' }}>
            <Tag
                style={{
                    backgroundColor: '#F5F5F5',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                }}
            >
                变量：{str ? <Var /> : '-'}
            </Tag>
        </Tooltip>
    );
};

export const getServerColumn = (props: any) => {
    return {
        ellipsis: {
            shwoTitle: false,
        },
        render: (_: any, row: any) => {
            return <ServerColumn {...row} run_mode={props.run_mode} />;
        },
        ...props,
    };
};
