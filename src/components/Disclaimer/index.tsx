import React from 'react';
import { useModel, FormattedMessage } from 'umi';
import { Modal } from 'antd';
import styled from 'styled-components';

const TextWrap = styled.div`
    margin-top: 5px;
`

const Disclaimer: React.FC<any> = (props) => {
    const { openModal, handleDisclaimerClose } = useModel('disclaimer');

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
                    <TextWrap style={{  fontWeight: 'bold',fontSize: 18, marginBottom: 10 }}><FormattedMessage id="disclaimer.title" />：</TextWrap>
                    <TextWrap><b>1.</b>&nbsp;<FormattedMessage id="disclaimer.content.one" />，<b><FormattedMessage id="disclaimer.content.two" /></b>。</TextWrap>
                    <TextWrap><b>2.</b>&nbsp;<FormattedMessage id="disclaimer.content.three" />，<b><FormattedMessage id="disclaimer.content.four" /></b>。</TextWrap>
                </div>
            </Modal>
        </>
    );
};

export default Disclaimer;