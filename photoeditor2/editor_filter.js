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

        // 積和
        function sumOfProducts(matrix1, matrix2, order) {
            var i, j, total = 0;
            for (i = 0; i < order; i++) {
                for (j = 0; j < order; j++) {
                    total += matrix1[i][j] * matrix2[i][j];
                }
            }
            return total;
        }

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

        // bright constant value
        types.bright = function(input, output) {
            var i, j, k, inc = 25;
            for (i = 0; i < input.height; i++) {
                for (j = 0; j < input.width; j++) {
                    k  = (i * input.width + j) * 4;
                    output.data[k] = ((input.data[k] + inc) < 256) ? input.data[k] + inc : 255; // R
                    output.data[k + 1] = ((input.data[k + 1] + inc) < 256) ? input.data[k + 1] + inc : 255; // G
                    output.data[k + 2] = ((input.data[k + 2] + inc) < 256) ? input.data[k + 2] + inc : 255; // B
                }
            }
            return output;
        };

        // grayscale
        types.grayscale = function(input, output) {
            var i, j, k, avg;
            for (i = 0; i < input.height; i++) {
                for (j = 0; j < input.width; j++) {
                    k  = (i * input.width + j) * 4;
                    avg = parseInt((input.data[k] + input.data[k + 1] + input.data[k + 2]) / 3, 10);
                    output.data[k] = avg; // R
                    output.data[k + 1] = avg; // G
                    output.data[k + 2] = avg; // B
                }
            }
            return output;
        };

        /*
         * halftone
         *
         * Bayer16 = [ 0,  8,  2, 10] = [B], [4] = [4, 4, 4, 4]   [B'] = 16 * [B] + [4]
         *           [12,  4, 14, 16]
         *           [ 3, 11,  1,  9]
         *           [15,  7, 13,  5]
         */
        types.halftone = function () {
            var avg, f, g, i, j, k;

            // first step: draw grayscale to canvas
            input = cxt.getImageData(0, 0, canvas.width, canvas.height);
            output = cxt.getImageData(0, 0, canvas.width, canvas.height);
            for (i = 0; i < input.height; i++) {
                for (j = 0; j < input.width; j++) {
                    k  = (i * input.width + j) * 4;
                    avg = parseInt((input.data[k] + input.data[k + 1] + input.data[k + 2]) / 3, 10);
                    input.data[k] = avg; // R
                    input.data[k + 1] = avg; // G
                    input.data[k + 2] = avg; // B
                }
            }
            cxt.putImageData(output, 0, 0, canvas.width, canvas.height);

            // second step: transform grayscale to halftone
            input = cxt.getImageData(0, 0, input.width, input.height);
            var bayerpattern = [];
            bayerpattern[0] = [ 0,  8,  2, 10];
            bayerpattern[1] = [12,  4, 14,  6];
            bayerpattern[2] = [ 3, 11,  1,  9];
            bayerpattern[3] = [15,  7, 13,  5];

            for (i = 0; i < input.height; i++) {
                for (j = 0; j < input.width; j++) {
                    k  = (i * input.width + j) * 4;
                    if ((bayerpattern[i % 4][j % 4] * 16 + 8) <= input.data[k]) {
                        output.data[k] = output.data[k + 1] = output.data[k + 2] = 255;
                    } else {
                        output.data[k] = output.data[k + 1] = output.data[k + 2] = 0;
                    }
                }
            }
            return output;
        };

        // smoothing filter
        types.smooth = function () {

            var i ,j ,k ,l, m, n, sumRed, sumGreen, sumBlue;

            // average smoothing
            input = cxt.getImageData(0, 0, canvas.width, canvas.height);
            output = cxt.getImageData(0, 0, canvas.width, canvas.height);
            for (i = 1; i < input.height - 1; i++) {
                for (j = 1 ; j < input.width - 1; j++) {
                    sumRed = sumGreen = sumBlue = 0;
                    k  = (i * input.width + j) * 4;
                    for (l = -1; l <= 1; l++) {
                        for (m = -1; m <= 1; m++) {
                            n = k + (l * input.width + m) * 4;
                            sumRed   += input.data[n];
                            sumGreen += input.data[n + 1];
                            sumBlue  += input.data[n + 2];
                        }
                    }
                    output.data[k]     = Math.floor(sumRed / 9);    // R
                    output.data[k + 1] = Math.floor(sumGreen / 9);  // G
                    output.data[k + 2] = Math.floor(sumBlue / 9);   // B
                }
            }

            return output;

        };

        //sharpen
        types.sharpen = function () {

            var i ,j ,k ,l, m, n;

            // sharpening filter
            var filter = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

            input = cxt.getImageData(0, 0, canvas.width, canvas.height);
            output = cxt.getImageData(0, 0, canvas.width, canvas.height);
            for (i = 1; i < input.height - 1; i++) {
                for (j = 1 ; j < input.width - 1; j++) {
                    sumRed = sumGreen = sumBlue = 0;
                    k  = (i * input.width + j) * 4;
                    for (l = -1; l <= 1; l++) {
                        for (m = -1; m <= 1; m++) {
                            n = k + (l * input.width + m) * 4;
                            sumRed   += input.data[n] * filter[(l + 1) * 3 + m + 1];
                            sumGreen += input.data[n + 1] * filter[(l + 1) * 3 + m + 1];
                            sumBlue  += input.data[n + 2] * filter[(l + 1) * 3 + m + 1];
                        }
                    }
                    output.data[k] = sumRed;
                    output.data[k + 1] = sumGreen;
                    output.data[k + 2] = sumBlue;
                }
            }
            return output;
        };

        // detect edge (3x3 sobel filter)
        types.edge = function (input) {

            var i, j, l, m, n, sum, absSum;
            var filter = [-1, 0, 1, -2, 0, 2, -1, 0, 1];

            // not consider image border
            for (i = 1; i < input.height - 1; i++) {
                for (j = 1; j < input.width - 1; j++) {
                    sum = 0;
                    k  = (i * input.width + j) * 4;
                    for (l = -1; l <= 1; l++) {
                        for (m = -1; m <= 1; m++) {
                            n = k + (l * input.width + m) * 4;
                            // only grayscale
                            sum += input.data[n] * filter[(l + 1) * 3 + m + 1];
                        }
                    }

                    absSum = Math.floor(Math.abs(sum));
                    absSum = (absSum > 255) ? 255 : absSum;

                    output.data[k] = absSum;
                    output.data[k + 1] = absSum;
                    output.data[k + 2] = absSum;
                    output.data[k + 3] = 255;
                }
            }

            return output;
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
