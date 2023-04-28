import { Alert } from 'antd';
import { history, useIntl } from 'umi'
import styled from 'styled-components';
import { OPENANOLIS_LOGIN_URL } from '@/utils/utils';

const SpanText = styled.span`
  font-family: PingFangSC;
  font-weight: 400;
  font-size: 14px;
  color: #1890FF;
  letter-spacing: 0;
  line-height: 24px;
  cursor: pointer;
`
export default () => {
  const { formatMessage } = useIntl()

  const notLoginToLogin = () => {
    if (BUILD_APP_ENV === 'openanolis') {
      return window.location.href = OPENANOLIS_LOGIN_URL + location.pathname + location.search
    }
    return history.push(`/login?redirect_url=${window.location.pathname}`)
  }

  return (
    <Alert message={
      <div>
        <span>{formatMessage({ id: 'you.haven.not.signed.in' })}</span>
        <SpanText onClick={notLoginToLogin}>
          {formatMessage({ id: 'go.to.login' })}
        </SpanText>
      </div>
    }
      type="info"
      showIcon
      closable />
  )
}