import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/keymap/sublime'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/shell/shell'

import { Controlled as CodeMirror } from 'react-codemirror2'

import styles from './index.less'

export default ({ code, onChange, readOnly = false, mode = 'shell' }: any) => {
    return (
        <CodeMirror
            value={code}
            className={styles.code_wrapper}
            options={{
                theme: 'monokai',
                keyMap: 'sublime',
                lineNumbers: mode === 'yaml',
                mode,
                readOnly
            }}
            onBeforeChange={(editor, data, value) => onChange(value)}
        />
    )
}