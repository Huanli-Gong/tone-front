import { CloseOutlined } from '@ant-design/icons';
import { Space, Typography, Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import AnswerContent from './AnswerContent';
import cls from 'classnames';
import SelfHelpModule from './SelfHelpModule';
import Feedback from './Feedback';
import { getBootSetting } from '@/pages/SystemConf/Question/Knowledge/services';
import { useRequest } from 'umi';
import { useHelperBootContext } from '../Provider';
import { CHART_DEFAULT_BOTTOM_PX } from '..';

const Container = styled.div.attrs((props: any) => ({
    style: {
        transform: `translate(${props.pos.x}px, ${props.pos.y}px)`,
    },
}))<AnyType>`
    position: fixed;
    width: 400px;
    height: 500px;
    background-color: #f0f3f6;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.12), 0 0 12px 5px rgba(0, 0, 0, 0.09);
    border-radius: 10px;
    overflow: hidden;

    right: 64px;
    bottom: ${CHART_DEFAULT_BOTTOM_PX};
    z-index: 1000;
`;

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
`;

const Navbar = styled.div`
    height: 48px;
    width: 400px;
    background-color: #ffffff;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    border-radius: 10px 10px 0 0;
    border-bottom: 1px solid #d9d9d9;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 16px;
    padding-right: 16px;

    user-select: none;

    .cursor-pointer {
        cursor: pointer;
    }
`;

const MenuBar = styled.div`
    user-select: none;

    height: 40px;
    width: 400px;
    background-color: #ffffff;
    display: flex;
    border-bottom: 1px solid #d9d9d9;

    div:not(:last-child)::before {
        content: '';
        position: absolute;
        right: 0;
        height: 20px;
        width: 1px;
        background-color: #d9d9d9;
    }

    .active,
    div {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: pointer;

        &::after {
            content: '';
            position: absolute;
            bottom: 5px;
            width: 62px;
            height: 2px;
        }
    }

    .active {
        color: #205ce8;
        font-weight: 500;
        &::after {
            background-color: #205ce8;
        }
    }
`;

const ChartWrapper = styled.div`
    height: 452px;
    wdith: 100%;
`;

const GroupQrCodeCls = styled.div`
    padding: 6px;
    display: flex;
    width: 180px;
    height: 180px;

    img {
        width: 100%;
        height: 100%;
    }
`;

const HelperContext: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { pos } = props;
    const [open, setOpen] = React.useState(false);
    const { setActive, setFeedback, active, feedback } = useHelperBootContext();

    const { data } = useRequest(getBootSetting, { initialData: { group_link: '' } });

    React.useImperativeHandle(ref, () => ({
        toggle() {
            setOpen(!open);
        },
        show() {
            setOpen(true);
        },
    }));

    const handleClose = () => {
        setOpen(false);
    };

    if (!open) return <></>;

    return (
        <Container pos={pos}>
            {!feedback ? (
                <Wrapper>
                    <Navbar>
                        <Typography.Text strong>T-One答疑助手</Typography.Text>

                        <Space>
                            <Typography.Text
                                className="cursor-pointer"
                                onClick={() => setFeedback(true)}
                            >
                                意见反馈
                            </Typography.Text>

                            {data?.group_link && (
                                <Tooltip
                                    color={'#fff'}
                                    placement="bottom"
                                    title={
                                        <GroupQrCodeCls>
                                            <img src={data?.group_link} />
                                        </GroupQrCodeCls>
                                    }
                                >
                                    <Typography.Text className="cursor-pointer">
                                        加入答疑群
                                    </Typography.Text>
                                </Tooltip>
                            )}

                            <CloseOutlined style={{ color: '#BFBFBF' }} onClick={handleClose} />
                        </Space>
                    </Navbar>
                    <ChartWrapper>
                        <MenuBar>
                            <div
                                className={cls(active === 0 ? 'active' : '')}
                                onClick={() => setActive(0)}
                            >
                                常见问题
                            </div>
                            <div
                                className={cls(active === 1 ? 'active' : '')}
                                onClick={() => setActive(1)}
                            >
                                自助排查
                            </div>
                        </MenuBar>

                        <div>{active === 0 ? <AnswerContent /> : <SelfHelpModule />}</div>
                    </ChartWrapper>
                </Wrapper>
            ) : (
                <Feedback back={() => setFeedback(false)} />
            )}
        </Container>
    );
};

export default React.forwardRef(HelperContext);
