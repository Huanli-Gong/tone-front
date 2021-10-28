import React from 'react';
import styles from './index.less'

export default (props:any) =><div className={styles.part_title}>{props.text}{props.children}<div className={styles.line}/></div>