Canvasを使った画像加工
=====

*[https://github.com/s-hiroshi/photoeditor](https://github.com/s-hiroshi/photoeditor)が正式版です。こちらは練習用です。*


確認ブラウザ
----------

Firefox 16.0.2


依存ライブラリ
----------

* jQuery 1.8.2
* jQuery UI


オブジェクト実装パターン
----------

実装オブジェクトはApp.namespaceで管理する。

* 実装オブジェクトは1ファイルに１オブジェクトを定義する。
* 実装オブジェクトの利用はeditor_main.jsで行う。

### オブジェクトの実装

実装オブジェクトとはApp.namespaceメソッド(app.js)を使い下記のパターンで定義したオブジェクト(example.js)。

    jQuery(function() {

        /**
         * オブジェクトの実装パターン
         */
        var example = App.namespace('example')

        // 実装の定義
        (function() {
            // プライベート変数の例。
            var privateVar;

            // プライベート関数の例。
            function privateFunction() {};

            /**
             * パブリックな関数の例。
             */
            function publicFunction() {};

            // パブリックメソッドの設定
            example.publicFunction = publicFunction;
       }());

    });


### 実装オブジェクトの利用(main.js)

実装オブジェクトはmain.jsから利用する。

    jQuery(function($) {
        var example = App.namespace('example');
        ....
    });


トップレベル
----------

グローバル変数はjQueryとApp。


名前空間
----------

App.namespaceは引数に指定されたオブジェクトが内部オブジェクトリストにあるときはそのオブジェクトを返す。
無ければ空オブジェクト{}を作成し内部オブジェクトリストに登録して返す。
