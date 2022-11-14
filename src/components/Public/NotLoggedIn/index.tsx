import React from 'react';
import { Alert } from 'antd';
import { history, useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components';

const SpanText = styled.span`
  font-family: PingFangSC;
  font-weight: 400;
  font-size: 14px;
  color: #1890FF;
  letter-spacing: 0;
  line-height: 24px;
  cursor: pointer;
`
export default (props: any) => {
  const { formatMessage } = useIntl()

  return (
    <Alert message={
      <div>
        <span>{formatMessage({id: 'you.haven.not.signed.in'})}</span>
        <SpanText onClick={()=> { history.push(`/login?redirect_url=${window.location.pathname}`) }}>
          {formatMessage({id: 'go.to.login'})}
        </SpanText>
      </div>
    }
      type="info"
      showIcon 
      closable />
  )
}