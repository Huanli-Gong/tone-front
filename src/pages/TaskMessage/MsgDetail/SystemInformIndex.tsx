/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Spin, Space, Typography, Badge, List, Avatar, Button, Row, Col, Pagination } from 'antd';
import type { SysListItem } from './data';
import MsgEmpty from './Component/index';
import styles from './index.less';
import {
    handleTypeRefused,
    handleTypePassed,
    NoticeItem,
    jumpPage,
    handleTypeWait,
} from '@/components/RightContent/components/utils';
import { queryApplyMsg, allTagApplyRead, singleSystemRead } from '@/services/Workspace';
import { requestCodeMessage, switchUserRole } from '@/utils/utils';

const SystemInformIndex: React.FC<SysListItem> = ({ tab, height: layoutHeight }) => {
    const [sysMsg, setSysMsg] = useState([]);
    const [sysLoading, setSysLoading] = useState(false);
    const [total, setTotal] = useState<any>([]);
    const [params, setParams] = useState<any>({ page_num: 1, page_size: 20, is_read: '1' });
    const { msgNum, increment } = useModel('msg', (ret) => ({
        msgNum: ret.msgNum,
        increment: ret.increment,
    }));

    // 获取系统通知消息列表
    const getSysMsg = async () => {
        setSysLoading(true);
        const data = await queryApplyMsg(params);
        if (data.code === 200) {
            setSysMsg(data.data);
            setTotal(data);
            setSysLoading(false);
        }
    };

    // 系统全部已读
    const handleAllSysRead = async () => {
        const data = await allTagApplyRead();
        if (data.code === 200) {
            getSysMsg();
            increment();
        } else {
            requestCodeMessage(data.code, data.msg);
        }
    };
    const jumpRoute = async (item: any) => {
        if (!item.is_read) {
            const data = await singleSystemRead({ msg_id: item.id });
            if (data.code === 200) {
                getSysMsg();
                increment();
            }
        }
        const obj = JSON.parse(item.content);
        const name = obj.status;
        const action = obj.action;
        const ws_id = obj.ws_info === undefined ? '' : obj.ws_info.ws_id;
        jumpPage(name, action, ws_id);
    };

    useEffect(() => {
        if (tab === '2') {
            getSysMsg();
        }
    }, [tab, params]);

    const handleMsgType = (item: any) => {
        const obj = JSON.parse(item.content);

        if (obj.status === 'waiting') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user}>
                            {obj.operator_info.user_name}
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            申请{handleTypeWait(obj.action)}Workspace
                        </Typography.Text>
                        <Typography.Text className={styles.list_ws_name}>
                            <span style={{ cursor: 'pointer' }}>{obj.ws_info.ws_show_name}</span>
                        </Typography.Text>
                    </Typography.Text>
                </div>
            );
        } else if (obj.status === 'passed') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user}>
                            {obj.operator_info.user_name}
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            {obj.action === 'join' ? '通过你加入' : '通过'}
                        </Typography.Text>
                        <Typography.Text className={styles.list_ws_name}>
                            <span style={{ cursor: 'pointer' }}>{obj.ws_info.ws_show_name}</span>
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            {handleTypePassed(obj.action)}
                        </Typography.Text>
                    </Typography.Text>
                </div>
            );
        } else if (obj.status === 'refused') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user}>
                            {obj.operator_info.user_name}
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            {obj.action === 'join' ? '拒绝你加入' : '拒绝'}
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            {obj.ws_info.ws_show_name}
                        </Typography.Text>
                        <Typography.Text className={styles.list_title}>
                            {handleTypeRefused(obj.action)}
                        </Typography.Text>
                    </Typography.Text>
                </div>
            );
        } else {
            if (obj.action === 'set_ws_role') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user}>
                                {obj.operator_info.user_name}
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                {obj.operator_info.action === 'add' ? '把你添加为' : '把你设置为'}
                            </Typography.Text>
                            <Typography.Text className={styles.list_ws_name}>
                                <span style={{ cursor: 'pointer' }}>
                                    {obj.ws_info.ws_show_name}
                                </span>
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                {switchUserRole(obj.role_title)}
                            </Typography.Text>
                        </Typography.Text>
                    </div>
                );
            } else if (obj.action === 'set_sys_role') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user}>
                                {obj.operator_info.user_name}
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                把你添加为T-One
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                {switchUserRole(obj.role_title)}
                            </Typography.Text>
                        </Typography.Text>
                    </div>
                );
            } else if (obj.action === 'remove') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user}>
                                {obj.operator_info.user_name}
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                把你移除
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                {obj.ws_info.ws_show_name}
                            </Typography.Text>
                        </Typography.Text>
                    </div>
                );
            } else {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user}>
                                {obj.operator_info.user_name}
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>把</Typography.Text>
                            <Typography.Text className={styles.list_ws_name}>
                                <span style={{ cursor: 'pointer' }}>
                                    {obj.ws_info.ws_show_name}
                                </span>
                            </Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                owner转让给你
                            </Typography.Text>
                        </Typography.Text>
                    </div>
                );
            }
        }
    };

    return (
        <Spin spinning={sysLoading}>
            {sysMsg.length > 0 ? (
                <>
                    <div className={styles.read_father} style={{ height: layoutHeight - 183 }}>
                        <div className={styles.read_warp}>
                            <Space>
                                <Typography.Text className={styles.msg_text}>
                                    一共{msgNum?.apply_msg_total_num}条通知，其中
                                    {msgNum?.apply_msg_unread_num}条未读
                                </Typography.Text>
                                <Typography.Text className={styles.msg_read}>
                                    <Button
                                        type="link"
                                        onClick={handleAllSysRead}
                                        disabled={msgNum.apply_msg_unread_num === 0}
                                    >
                                        全部已读
                                    </Button>
                                </Typography.Text>
                            </Space>
                        </div>
                        <div className={styles.read_content}>
                            <List
                                itemLayout="horizontal"
                                dataSource={sysMsg}
                                renderItem={(item: any) => {
                                    const obj = JSON.parse(item.content);
                                    return (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar src={obj.operator_info.avatar} />}
                                                title={
                                                    <NoticeItem
                                                        item={item}
                                                        onClick={() => jumpRoute(item)}
                                                    >
                                                        {handleMsgType(item)}
                                                    </NoticeItem>
                                                }
                                                description={item.gmt_created}
                                            />
                                            <Space>
                                                {item.is_read ? '' : <Badge dot />}
                                                {!item.is_read ? (
                                                    <Button
                                                        style={{ marginLeft: 20 }}
                                                        onClick={() => jumpRoute(item)}
                                                    >
                                                        查看
                                                    </Button>
                                                ) : obj.action === 'set_ws_role' ||
                                                  obj.action === 'set_sys_role' ||
                                                  obj.action === 'remove' ||
                                                  (obj.status == 'refused' &&
                                                      obj.action == 'join') ? (
                                                    <></>
                                                ) : (
                                                    <Button
                                                        style={{ marginLeft: 20 }}
                                                        onClick={() => jumpRoute(item)}
                                                    >
                                                        查看
                                                    </Button>
                                                )}
                                            </Space>
                                        </List.Item>
                                    );
                                }}
                            />
                        </div>
                    </div>
                    <Row style={{ marginTop: 15, height: 35 }}>
                        <Col span={4} style={{ paddingLeft: 15 }}>
                            共 {total.total} 条
                        </Col>
                        <Col span={20} style={{ textAlign: 'right' }}>
                            <Pagination
                                showQuickJumper
                                total={total.total}
                                showSizeChanger
                                current={total.page_num}
                                defaultPageSize={20}
                                defaultCurrent={1}
                                onChange={(page_num: number, page_size: any) => {
                                    setParams({
                                        ...params,
                                        page_num,
                                        page_size,
                                    });
                                }}
                                onShowSizeChange={(page_num: number, page_size: any) => {
                                    setParams({
                                        ...params,
                                        page_num: 1,
                                        page_size,
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                </>
            ) : (
                <MsgEmpty />
            )}
        </Spin>
    );
};
export default SystemInformIndex;
