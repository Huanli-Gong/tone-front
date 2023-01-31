import { Extension, textInputRule } from '@tiptap/core';
import data from './data'

export const emojis = data.map((i) => i.list).flat();

export const emojiRegs = emojis.map((i: any) => {
    const t = `\\[${i.name}\\]`
    const reg = new RegExp(t, "g")
    return {
        find: reg,
        replace: i.emoji,
        emoji_name: `[${i.name}]`,
    }
})

export const replaceEmoji = (str: string) => {
    return emojiRegs.reduce((pre, cur) => {
        return pre.replaceAll(cur.replace, cur.emoji_name)
    }, str)
}

export const tarnsformEmoji = (str: any) => {
    if (Object.prototype.toString.call(str) === "[object String]") {
        return emojiRegs.reduce((pre, cur) => {
            return pre.replace(cur.find, cur.replace)
        }, str)
    }
    return str
}

export const SmilieReplacer = Extension.create({
    name: 'smilieReplacer',
    addInputRules() {
        return emojiRegs.map(textInputRule)
    },
})