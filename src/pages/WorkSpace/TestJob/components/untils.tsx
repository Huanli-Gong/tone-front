import React from 'react';

import { Tag, Space, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import cls from 'classnames';
import styles from './index.less';
import styled from 'styled-components';
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg';
import { useCopyText } from '@/utils/hooks';
import { useIntl } from 'umi';

const LinkSpan = styled(Typography.Link)`
    position: absolute;
    right: 5px;
    top: 2px;
    &:hover {
        svg path {
            fill: #1890ff;
        }
    }
`;

export const tagRender = (props: any) => {
    const { label, closable, onClose, value } = props;
    return (
        <Tag
            color={label?.props?.color}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label?.props?.children || value}
        </Tag>
    );
};

export const CopyLinkSpan: React.FC<{ onCopy: any; style?: React.CSSProperties }> = ({
    onCopy,
    style,
}) => {
    const intl = useIntl();
    const handleCopyText = useCopyText(intl.formatMessage({ id: 'request.copy.success' }));
    return (
        <LinkSpan onClick={() => handleCopyText(onCopy?.())} style={style || {}}>
            <CopyLink />
        </LinkSpan>
    );
};

export const QusetionIconTootip: React.FC<any> = ({ title, desc, className }: any) => (
    <Space>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{title}</span>
        <Tooltip
            overlayClassName={cls(styles.table_question_tooltip, className)}
            placement="bottom"
            arrowPointAtCenter
            title={desc}
            color="#fff"
        >
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />
        </Tooltip>
    </Space>
);

export const getHasMuiltip = (d: any) => {
    if (d && JSON.stringify(d) !== '{}') {
        const keys = Object.keys(d);
        for (let i = 0, len = keys.length; i < len; i++) {
            if (d[keys[i]].length > 1) return true;
        }
    }
    return false;
};

export const formatter = (val: any) =>
    val && typeof +val === 'number' ? parseInt(val as any) + '' : '';

export const tarnsCaseEnvInfo = ({ env_info, confVar }: any) => {
    const conf_var = confVar ? JSON.parse(confVar) : [];

    const v = conf_var.map((i: any) => i.name);
    const envs: any = env_info
        ? Object.keys(env_info).map((key) => ({ name: key, val: env_info[key] }))
        : [];

    const $env_info = envs.reduce((p: any, c: any) => {
        if (v.includes(c.name)) return p.concat({ ...c, is_sys: true });
        return p.concat(c);
    }, []);
    return $env_info;
};

export const transCaseScript = (conf: any) => {
    const setup_info = conf.setup_info === '[]' ? '' : conf.setup_info;
    const cleanup_info = conf.cleanup_info === '[]' ? '' : conf.cleanup_info;
    return {
        setup_info,
        cleanup_info,
    };
};
export const transConfData = ($case: any, conf: any) => {
    const { var: confVar, title, name } = $case;
    const {
        server_is_deleted,
        test_case_id,
        repeat,
        timeout,
        need_reboot,
        is_instance,
        priority,
        console: $console,
        monitor_info,
    } = conf;

    const conf_var = confVar ? JSON.parse(confVar) : [];
    const { env_info } = conf;

    const envs: any = env_info
        ? Object.keys(env_info).map((key) => ({ name: key, val: env_info[key] }))
        : [];

    const setup_info = conf.setup_info === '[]' ? '' : conf.setup_info;
    const cleanup_info = conf.cleanup_info === '[]' ? '' : conf.cleanup_info;

    /* is_sys字段用来判断是否系统级变量&只可改动不可删除 */
    const v = conf_var.map((i: any) => i.name);
    /* conf_var */
    const $env_info = envs.reduce((p: any, c: any) => {
        if (v.includes(c.name)) return p.concat({ ...c, is_sys: true });
        return p.concat(c);
    }, []);

    /* conf 基本数据结构 */
    const $data = {
        setup_info,
        cleanup_info,
        env_info: $env_info,
        title: title,
        name: name,
        id: test_case_id,
        repeat,
        timeout,
        need_reboot,
        priority,
        console: $console,
        monitor_info,
        server_is_deleted,
        /* is_instance,
        server_object_id: null,
        custom_channel: null,
        custom_ip: null,
        server_tag_id: [], */
        ip: null,
    };

    if (server_is_deleted) return $data;

    const { customer_server, server_tag_id, ip, server_object_id } = conf;

    const obj = {
        ...conf,
        ...$data,
        ip,
        server_object_id,
    };

    /* if (server_tag_id) {
        if (lodash.isArray(server_tag_id)) {
            obj.server_tag_id = lodash.filter(server_tag_id);
        } else if (typeof server_tag_id === 'string' && server_tag_id.indexOf(',') > -1) {
            obj.server_tag_id = server_tag_id.split(',').map((i: any) => i - 0);
        } else {
            obj.server_tag_id = [];
        }
    } */

    if (customer_server && JSON.stringify(customer_server) !== '{}') {
        obj.custom_channel = customer_server.custom_channel;
        obj.custom_ip = customer_server.custom_ip;
        obj.ip = customer_server.custom_ip;
    }

    if (Object.prototype.toString.call(is_instance) === '[object Number]') {
        obj.is_instance = is_instance;
    }

    if (server_tag_id) {
        obj.server_tag_id = server_tag_id;
    }

    return obj;
};
