export const transQuery = (obj: any) => {
    // console.log(obj)
    const json = Object.entries(obj).reduce((pre: any, cur: any) => {
        const [name, val] = cur;
        if (['creation_time', 'completion_time'].includes(name)) {
            if (!val) return pre
            pre[name] = JSON.stringify(val);
            return pre;
        }
        const $type = Object.prototype.toString.call(val);
        if (['[object Undefined]', '[object Null]'].includes($type)) return pre;

        if ($type === '[object Array]') {
            pre[name] = JSON.stringify(val.map((i: any) => {
                if (i.value) 
                    return i.value
                return i
            }));
            return pre;
        }

        if ($type === '[object Object]') {
            pre[name] = val.value;
            return pre;
        }

        pre[name] = val;

        return pre;
    }, {});
    return json;
};
