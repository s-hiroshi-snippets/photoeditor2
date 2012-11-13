/**
 * Appのトップレベルオブジェクト(jQueryのトップレベル)
 *
 * <p>Christian Johansen(著),長尾高弘(翻訳)『テスト駆動JavaScript』ASCII
 * 下記サイトで配布されているスクリプトを変更。</p>
 * <p>http://tddjs.com/</p>
*/
function App() {}
/**
 *  名前空間を設定・管理する。
 *
 *  引数に対応する既存のオブジェクトが存在するときは
 *  そのオブジェクトを返す。存在しないときは空のオブジェクト作成・登録してして返す。
 *
 *  @param {String} name オブジェクト名
 *  @return {Object} 引数にマップされたオブジェクト
 */

App.namespace = function() {
    var objectList = {};
    return function(name) {
        if (typeof objectList[name] === "undefined") {
            objectList[name] = {};
        }

        return objectList[name];
    };
}();

