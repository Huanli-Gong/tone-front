import React from 'react';
import { useModel } from 'umi';
import { Modal } from 'antd';
import styled from 'styled-components';

const TextWrap = styled.div`
    margin-top: 5px;
`

const Disclaimer: React.FC<any> = (props) => {

    const { openModal, handleDisclaimerClose } = useModel('disclaimer', (ret) => ({
        openModal: ret.openModal,
        handleDisclaimerClose: ret.handleDisclaimerClose
    }));

    const handleOk = () => {
        props.onOk(true)
        handleDisclaimerClose()
    };

    const handleCancel = () => {
        props.onOk(false)
        handleDisclaimerClose()
    };

    return (
        <>
            <Modal
                width={670}
                title={false}
                open={openModal}
                onOk={handleOk}
                style={{ top: '25%' }}
                onCancel={handleCancel}
            >
                <div style={{ margin: '16px 0px', fontSize: 14 }}>
                    <TextWrap style={{  fontWeight: 'bold',fontSize: 18, marginBottom: 10 }}>免责声明：</TextWrap>
                    <TextWrap><b>1.</b>&nbsp;当前测试平台所提供的服务仅供在测试环境使用，<b>本平台不承诺对用户测试机器的稳定性保障</b>。</TextWrap>
                    <TextWrap><b>2.</b>&nbsp;若用户自行把测试或生产机器加到本平台执行测试并影响到业务运行的，<b>本测试平台及平台的研发团队概不负责</b>。</TextWrap>
                </div>
            </Modal>
        </>
    );
};

export default Disclaimer;