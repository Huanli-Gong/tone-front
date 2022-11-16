import React from 'react';
import { Alert } from 'antd';
import { history, useModel, useIntl, FormattedMessage } from 'umi'
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
  const { initialState, setInitialState } = useModel('@@initialState')

  const notLoginToLogin = () => {
    const { login_url } = initialState?.authList || {}
    if (BUILD_APP_ENV === 'openanolis') {
        return window.location.href = login_url
    }
    return history.push(`/login?redirect_url=${window.location.pathname}`)
  }

  return (
    <Alert message={
      <div>
        <span>{formatMessage({id: 'you.haven.not.signed.in'})}</span>
        <SpanText onClick={notLoginToLogin}>
          {formatMessage({id: 'go.to.login'})}
        </SpanText>
      </div>
    }
      type="info"
      showIcon 
      closable />
  )
}