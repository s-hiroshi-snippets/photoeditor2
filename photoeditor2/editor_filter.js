/**
 * minKer Photo editor 画像フィルタ
 *
 * @author Hiroshi Sawai <info@info-town.jp>
 */
jQuery(function($) {

    // filterオブジェクト作成
    var filter = App.namespace('filter');

    // filterオブジェクト実装
    (function () {

        /*
         *　filter定義
         */

        // フィルタのタイプ
        var types = {};

        /**
         * モノクロ画像
         * @param {ImageData} img 元画像
         * @return {ImageData} フィルタを適用したImageDataオブジェクト
         */
        types.mono = function(img) {
            var outputData = [];
            var i, j, k, avg;
            for (i = 0; i < img.height; i++) {
                for (j = 0; j < img.width; j++) {
                    // index of target pixel
                    k  = (i * img.width + j) * 4;
                    avg = parseInt((img.data[k] + img.data[k + 1] + img.data[k + 2]) / 3, 10);
                    // to binary image
                    avg = (avg < 128) ? 0 : 255;
                    outputData[k] = avg;         // R
                    outputData[k + 1] = avg;     // G
                    outputData[k + 2] = avg;     // B
                    outputData[k + 3] = img.data[k + 3];       // Alpha
                }
            }
            img.data.set(outputData);
            return img;
        };

        /**
         * フィルタリング処理
         */
        function filtering(filtername, input, output) {
            return types[filtername](input, output);
        }

        // 公開メソッド
        filter.filtering = filtering;
    }());

});
