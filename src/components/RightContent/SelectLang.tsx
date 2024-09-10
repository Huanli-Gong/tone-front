import React from 'react'
import { getLocale, setLocale, FormattedMessage } from 'umi'
import { Typography } from 'antd'

class SelectLang extends React.Component {
  changLang = () => {
    const locale = getLocale();
    if (!locale || locale === 'zh-CN') {
      setLocale('en-US', false);
    } else {
      setLocale('zh-CN', false);
    }
  };

  render() {
    return (
      <Typography.Text
        style={{ cursor: 'pointer', color: '#FFF', width: 19 }}
      >
        <span onClick={this.changLang}>
          <FormattedMessage id="navbar.lang" />
        </span>
      </Typography.Text>
    )
  }
}

export default SelectLang