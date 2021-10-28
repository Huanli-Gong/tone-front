const request = window.indexedDB.open('tone')
var db;

request.onerror = function (event) {
    console.log('数据库打开报错');
};

request.onsuccess = function (event) {
    db = request.result;
    console.log( request.result )
    console.log('数据库打开成功');
};

export const read = () => {
    
}

export const create = (dataSource: any) => {

}