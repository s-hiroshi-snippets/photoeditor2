jQuery(function($) {

    var navList = $('#dialog li');

    // クリックイベントのコールバック関数
    var clickHandler  = function(i) {
        return function() {
            var parts = $('.tabs'),
                length = parts.length,
                k;
            for (k = 0; k < length; k++) {
                if (i === k) {
                    // activeクラスをタブメニューに設定
                    $(navList.get(k)).addClass('active');
                    // タブの表示
                    parts.css('display', 'none');
                    part = parts.get(k);
                    $(part).css('display', 'block');

                } else {
                    $(navList.get(k)).removeClass('active');
                }
            }
        };
    };

    // クライアント用マイページのタブ切替
    navList.each(function(i) {
        var callbackfunc = clickHandler(i);
        var listItem = navList.get(i);
        $(listItem).click(callbackfunc);
    });

});
