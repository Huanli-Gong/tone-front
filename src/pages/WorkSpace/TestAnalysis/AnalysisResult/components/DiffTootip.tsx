import React from 'react';
import { Tooltip, Row, Col } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import styled from 'styled-components';

const TitleFont = styled.span`
    color: rgba(0,0,0,0.65);
`
const Content = styled.div`
    width: 320px;
    height: 200px;
    border: 1px solid #ccc;
`
const ColDiv = styled.div`
    height: 40px;
    line-height: 20px;
`
const ColSpan = styled.span`
    height: 22px; 
    width: 88px;
    text-align: center;
    background: #0089FF; 
    border-radius: 4px;
    color: #fff;
    float: right;
    margin: 8px 8px 0 0;
`
const TextPublic = styled.div`
    border-right: 1px solid #ccc;
    height: 150px;
    padding-left: 12px;
`
export const DiffTootip : React.FC<any> = () => {
    return (
        <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
            title={
                <TitleFont>
                    功能测试与基准组结果不一致越多差异化越大。
                    <br />规则如下：由上到下<br />
                    <Content>
                        <Row>
                            <Col span={16}>
                                <ColDiv>
                                    <ColSpan>基准组</ColSpan>
                                </ColDiv>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <TextPublic style={{ paddingLeft: 0, textAlign: 'center' }}>
                                    <span style={{ paddingTop: 60, display: 'block' }}>由上到下</span>
                                </TextPublic>
                            </Col>
                            <Col span={8}>
                                <TextPublic>
                                    <p>pass</p>
                                    <p>fail</p>
                                    <p>fail</p>
                                    <p>pass</p>
                                </TextPublic>
                            </Col>
                            <Col span={8}>
                                <TextPublic style={{ borderRight: 'none' }}>
                                    <p>fail</p>
                                    <p>pass</p>
                                    <p>fail</p>
                                    <p>pass</p>
                                </TextPublic>
                            </Col>
                        </Row>
                    </Content>
                </TitleFont>
            }>
            <QuestionCircleOutlined />
        </Tooltip>
    )
}


