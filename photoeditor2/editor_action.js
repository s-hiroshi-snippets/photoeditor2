/**
 * 画像加工
 *
 * 参考サイト
 * http://www.programmingmat.jp/webhtml_lab/canvas_img.html
 * http://www.programmingmat.jp/webhtml_lab/canvas_putdata.html
 * http://atomicrobotdesign.com/blog/javascript/draw-a-rectangle-using-the-mouse-on-the-canvas-in-less-than-40-lines-of-javascript/
 * http://himaxoff.blog111.fc2.com/blog-entry-87.html
 * http://www.ajaxblender.com/howto-convert-img-to-grayscale-using-javascript.html
 * http://hooktail.org/computer/index.php?%A5%CF%A1%BC%A5%D5%A5%C8%A1%BC%A5%F3%BD%E8%CD%FD%28%A5%C7%A5%A3%A5%B6%CB%A1%29
 *
 * 画像をキャンパスへ描画する基本的な流れ
 * <ul>
 *     <li>img要素を作成(ノードには追加しない)
 *     <li>img要素に画像を読込
 *     <li>img要素をcanvasへ描画
 * </ul>
 *
 * @author Hiroshi Sawai <info@info-town.jp>
 */
jQuery(function($) {

    // photoeditorオブジェクト作成
    var photoeditor = App.namespace('photoeditor');

    // photoeditorオブジェクト実装
    (function () {

        var img;
        var canvas = $('<canvas>').appendTo($('#view')).get(0);
        var cxt = canvas.getContext('2d');

        var original;
        var filetype;

        // filterオブジェクト
        var filter;

        /**
         * filterオブジェクトを設定する。
         * @param filterObject
         * App.namespace('filter')で取得したオブジェクト
         */
        function setFilter(filterObject) {
            filter = filterObject;
        }

        // エラー表示
        function alert(text) {
            window.alert(text);
        }

        // エラー表示
        function alert(text) {
            window.alert(text);
        }

        // 画像が読み込まれていればtrueを返す。読み込まれていなければアラートを表示しfalseを返す
        function checkImage (img) {
            if ((img.width  > 0) === false ) {
                alert('画像がありません。');
                return false;
            }
            return true;
        }

        // 適切な画像タイプならばtrue。対応していないタイプならばアラートを表示してfalseを返す
        function checkFileType(text) {
            // ファイルタイプの確認
            if (text.match(/^image\/(png|jpeg|gif)$/) === null) {
                alert('対応していないファイル形式です。\nファイルはPNG, JPEG, GIFに対応しています。');
                return false;
            }
            filetype = text;
            return true;
        }

        /*
         * 画像ファイル読み込み・表示
         */
        // img要素から画像データを
        function loadImg(width, height) {
            return function() {
                // 画像ファイル読込はoriginalを初期化
                if (typeof width === 'undefined' || typeof height === 'undefined') {
                    original = null;
                }
                // サイズの設定
                width = width || this.width;
                height = height || this.height;
                canvas.width = width;
                canvas.height = height;
                // 読込
                try {
                    cxt.clearRect(0, 0, canvas.width, canvas.height);
                    cxt.drawImage(this, 0, 0, width, height);
                    if (original === null) {
                        original = cxt.getImageData(0, 0, width, height);
                        $('#org-width').val(width);
                        $('#org-height').val(height);
                    }
                    $(this).remove();
                } catch (e) {
                    alert('画像を開けませんでした。');
                }
            };
        }

        // 画像読込ハンドラ
        function readFile(reader) {
            return function() {
                // imgへオブジェクトを読み込む
                img = $('<img>').get(0);
                img.onload = loadImg();
                img.setAttribute('src', reader.result);
            };
        }

        // 参照ボタンで読込処理
        $('#upload').change (function() {
            var file, reader;

            // 選択したファイル情報
            file = this.files[0];

            // ファイルタイプの確認
            if (checkFileType(file.type) === false) {
                return false;
            }

            // canvasに描画
            reader = new FileReader();
            reader.onload = readFile(reader);
            reader.readAsDataURL(file);

        });

        // ドラッグアンドドロップで読込
        $('#view').get(0).ondragover = function() {
            return false;
        };

        // bind('ondrop', function() {});はうまく動かなかった(2012.11.07)
        $('#view').get(0).ondrop = function(event) {

            var file, reader;

            if (event.dataTransfer.files.length === 0) {
                alert('画像を開けませんでした。');
                return false;
            }

            // ドロップされたファイル情報
            file = event.dataTransfer.files[0];

            // ファイルタイプの確認
            if (checkFileType(file.type) === false) {
                return false;
            }

            // Canvasへの描画
            reader = new FileReader();
            reader.onload = readFile(reader);
            reader.readAsDataURL(file);

            // バブリング・デフォルト処理停止
            event.stopPropagation();
            event.preventDefault();

        };

        /*
         * オリジナル画像表示
         */
        $('#original').click(function () {
            canvas.width = original.width;
            canvas.height = original.height;
            cxt.clearRect(0, 0, original.width, original.height);
            cxt.putImageData(original, 0, 0);
        });

        /*
         * リサイズ
         */
        $('#resize').click(function () {
            // バリデーション
            // 横
            var width = $('#width').val();
            // 縦
            var height = $('#height').val();
            // 縦横比固定
            var isRatio = $('#ratio').is(':checked');

            if (width === '' && height === '') {
                alert('横幅または縦幅を入力してください。');
                return false;
            }

            if (isRatio === false && (width === '' || height === '')) {
                alert('縦横比固定にチェックを入れてない場合横・縦の両方入力してくだい。');
            }

            // widthを数値へキャスト
            if (width !== '') {
                try {
                    width = parseInt(width, 10);
                } catch (e) {
                    alert('数字を入力してください');
                    return false;
                }
            }

            // heightを数値へキャスト
            if (height !== '') {
                try {
                    height = parseInt(height, 10);
                } catch (e) {
                    alert('数字を入力してください');
                    return false;
                }
            }

            if (width !== '' && width <= 0) {
                alert('横幅はプラスの数字を入力してください');
                return false;
            }

            if (height !== '' && height <= 0) {
                alert('縦幅はプラスの数字を入力してください');
                return false;
            }

            // 縦横比固定優先
            // 縦横比固定のときは横幅優先
            if (isRatio && width > 0) {
                height = Math.floor(canvas.height * (width / canvas.width));
                $('#height').val(height);
            }
            else if (isRatio && height > 0) {
                width = Math.floor(canvas.width * (height / canvas.height));
                $('#width').val();
            }

            var canvasData = canvas.toDataURL();
            var img = $('<img>').get(0);
            img.onload = loadImg(width, height);
            img.setAttribute('src', canvasData);

        });

        // 縦幅の固定値が入力
        function validate(event) {
            // 未入力はなにもしない
            if ($(this).val() === '') {
                return false;
            }
            // キャスト(キャストできないときはエラーではなくNaNが返る)
            var height = parseInt($(this).val(), 10);
            // 0より大きい数字以外はアラート
            if ((height > 0) === false) {
                alert('0より大きい数字を入力してください。');
                return false;
            }
            // DOM要素のstyleプロパティでサイズ指定。!importantを除いて最優先で提要。
            // $('#selection').css()ではうまくいかない
            $('#selection').get(0).style.height = $(this).val() + 'px';
            // #selection要素のresizeイベントを発生させる
            $('#selection').trigger('resize');
            // バブリング・デフォルト停止
            event.stopPropagation();
            event.preventDefault();
        }



        /*
         * トリミング
         */
        //選択範囲用div要素表示
        $('#select').click(function(event) {
            $('#selection').resizable();
            $('#selection').draggable();
            $('#selection').css({
                'display': 'block'
            });
            event.stopPropagation();
            event.preventDefault();
        });

        // 選択範囲(div#selection要素)をリサイズで発生
        // triggerでも呼び出すのでbindを使う
        $('#selection').bind('resize', function(event) {
            $('#selected-width').val($(this).width());
            $('#selected-height').val($(this).height());
            event.stopPropagation();
            event.preventDefault();
        });

        // 横幅の固定値
        $('#trim-width').keyup(function(event) {
            // 未入力はなにもしない
            if ($(this).val() === '') {
                return false;
            }
            // キャスト(キャストできないときはエラーではなくNaNが返る)
            var width = parseInt($(this).val(), 10);
            // 0より大きい数字以外はアラート
            if ((width > 0) === false) {
                alert('0より大きい整数を入力してください。');
                return false;
            }
            // DOM要素のstyleプロパティでサイズ指定。!importantを除いて最優先で提要。
            // $('#selection').css()ではうまくいかない
            $('#selection').get(0).style.width = $(this).val() + 'px';
            // #rselection要素のresizeイベントを発生させる
            $('#selection').trigger('resize');
            // バブリング・デフォルト停止
            event.stopPropagation();
            event.preventDefault();
        });

        // 縦幅の固定値
        $('#trim-height').keyup(function(event) {
            // 未入力はなにもしない
            if ($(this).val() === '') {
                return false;
            }
            // キャスト(キャストできないときはエラーではなくNaNが返る)
            var height = parseInt($(this).val(), 10);
            // 0より大きい数字以外はアラート
            if ((height > 0) === false) {
                alert('0より大きい数字を入力してください。');
                return false;
            }
            // DOM要素のstyleプロパティでサイズ指定。!importantを除いて最優先で提要。
            // $('#selection').css()ではうまくいかない
            $('#selection').get(0).style.height = $(this).val() + 'px';
            // #selection要素のresizeイベントを発生させる
            $('#selection').trigger('resize');
            // バブリング・デフォルト停止
            event.stopPropagation();
            event.preventDefault();
        });

        // トリミング実行
        $('#trimming').click(function(event) {
            var rect = {};
            var data;
            // selectionの位置・サイズ取得
            rect.top= $('#selection').position().top;
            rect.left= $('#selection').position().left;
            rect.width = $('#selection').width();
            rect.height = $('#selection').height();
            $('#selection').css({
                'display': 'none'
            });
            // 選択範囲画像取得
            data = cxt.getImageData(rect.left, rect.top, rect.width, rect.height);
            // 画像出力
            canvas.width = data.width;
            canvas.height = data.height;
            cxt.putImageData(data, 0, 0);
        });


        /**
         * filter
         */
            // mono
        $('#mono').click(function (e) {
            var img = cxt.getImageData(0, 0, canvas.width, canvas.height);
            // フィルタ処理
            img = filter.filtering('mono', img);
            cxt.putImageData(img, 0, 0);
        });

        /*
         * サーバー通信
         */
        // サーバーへ画像保存
        $('#submit').click(function(e) {
            var data = {};
            var canvasData;
            // canvasデータ取得
            canvasData = $('canvas').get(0).toDataURL();
            // 不要な情報を取り除く
            canvasData = canvasData.replace(/^data:img\/png;base64,/, '');
            data.img = canvasData;
            // 送信処理(Ajax)
            $.ajax({
                url: 'photoeditor.php',
                type: 'POST',
                success: function(response) {
                },
                data: data,
                dataType: 'json'
            });
            return false;
        });

        // 画像加工
        $('#show-dialog').click(function() {
            $('#dialog').dialog({
                width: 300,
                height: 400
            });
        });

        // 公開メソッド
        photoeditor.setFilter = setFilter;

    }());

});
