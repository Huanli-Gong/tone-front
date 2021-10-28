import React from 'react'
import { getLocale, setLocale, FormattedMessage } from 'umi'
import { Typography, Popover } from 'antd'
import codeLibrary from '@/assets/svg/code_library.svg';
import styles from './index.less'

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
    const content = (
      <div>
        <img alt="codeLibrary" src={codeLibrary} style={{ marginRight: 5 }} /><span >功能开发中...</span>
      </div>
    );
    return (
      <Popover content={content} trigger="hover" placement="topLeft" overlayClassName={styles.popoverHiddenArrow}>
        <Typography.Text
          style={{ cursor: 'pointer', marginLeft: 25, marginRight: 18, color: '#FFF' }}
          onClick={this.changLang}
        >
          <FormattedMessage id="navbar.lang" />
        </Typography.Text>
      </Popover>
    )
  }
}

export default SelectLang