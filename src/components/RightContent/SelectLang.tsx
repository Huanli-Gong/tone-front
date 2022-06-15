import React from 'react'
import { getLocale, setLocale, FormattedMessage } from 'umi'
import { Typography, Popover } from 'antd'

class SelectLang extends React.Component {
  changLang = () => {
    const locale = getLocale();
    if (!locale || locale === 'zh-CN') {
      setLocale('en-US');
    } else {
      setLocale('zh-CN');
    }
  };

  render() {
    return (
      <Typography.Text
        style={{ cursor: 'pointer', color: '#FFF' }}
      // onClick={this.changLang}
      >
        <FormattedMessage id="navbar.lang" />
      </Typography.Text>
    )
  }
}

export default SelectLang