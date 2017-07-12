// 申請書管理アプリで関連レコードを表示する
(function() {
    'use strict';

    // 従業員番号をキーに登録状況を確認する
    function findExist(event) {

        var empListId = '16';
        var freelanceListId = '17';

        var targetRow = event.changes.row;
        var empCode = targetRow.value.従業員番号.value;

        var query;
        var appUrl;
        var xmlHttp;
        var respData;

        // 従業員登録状況テーブルの検索
        query = '';
        query += '従業員番号="' + empCode + '"';
        query = encodeURIComponent(query);
        appUrl = kintone.api.url('/k/v1/records') + '?app=' + empListId + '&query=' + query;

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", appUrl, false);
        xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xmlHttp.send(null);

        //取得したレコードをArrayに格納
        respData = JSON.parse(xmlHttp.responseText);

        // 結果件数が1以上（1以外はありえないけど。。）
        if (respData.records.length) {
            targetRow.value.登録状況_従業員番号.value = respData.records[0].従業員番号.value;
            targetRow.value.登録状況_氏名_本人.value = respData.records[0].氏名.value;
            targetRow.value.登録状況_氏名_配偶者.value = respData.records[0].氏名_配偶者.value;
            targetRow.value.登録状況_氏名_扶養親族.value = '';
            // 扶養親族氏名をとる
            for(var key in respData.records[0]){
                if(key.match(/氏名_扶養/)){
                    if(respData.records[0][key].value){
                        if(targetRow.value.登録状況_氏名_扶養親族.value.length){
                            targetRow.value.登録状況_氏名_扶養親族.value += ',';
                        }
                        targetRow.value.登録状況_氏名_扶養親族.value += respData.records[0][key].value;
                    }
                }
            }
        }
        else {
            // 結果件数が0
            // 個人事業主登録状況テーブルの検索
            query = '';
            query += '個人支払先番号="' + empCode + '"';
            query = encodeURIComponent(query);
            appUrl = kintone.api.url('/k/v1/records') + '?app=' + freelanceListId + '&query=' + query;

            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", appUrl, false);
            xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xmlHttp.send(null);

            //取得したレコードをArrayに格納
            respData = JSON.parse(xmlHttp.responseText);

            // 結果件数が1以上（1以外はありえないけど。。）
            if (respData.records.length) {
                targetRow.value.登録状況_従業員番号.value = respData.records[0].個人支払先番号.value;
                targetRow.value.登録状況_氏名_本人.value = respData.records[0].氏名.value;
                targetRow.value.登録状況_氏名_配偶者.value = '';
                targetRow.value.登録状況_氏名_扶養親族.value = '';
            }
            else {
                targetRow.value.登録状況_従業員番号.value = '';
                targetRow.value.登録状況_氏名_本人.value = '';
                targetRow.value.登録状況_氏名_配偶者.value = '';
                targetRow.value.登録状況_氏名_扶養親族.value = '';
            }

        }


        return event;

    }

    // 新規作成、詳細表示、編集で表示する    
    var eventList = [
        //        'app.record.create.show',
        //        'app.record.edit.show',
        //        'app.record.detail.show',
        'app.record.create.change.従業員番号',
        'app.record.edit.change.従業員番号',
    ];

    kintone.events.on(eventList, function(event) {
        findExist(event);
        return event;
    });

    // 書き込み禁止
    kintone.events.on([
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.create.change.申請書テーブル',
        'app.record.edit.change.申請書テーブル',
    ], function(event) {
        var rec = event.record;
        var table = rec.申請書テーブル.value;
        for (var i = 0; i < table.length; i++) {
            var rowData = table[i].value;
            rowData.登録状況_従業員番号.disabled = true;
            rowData.登録状況_氏名_本人.disabled = true;
            rowData.登録状況_氏名_配偶者.disabled = true;
            rowData.登録状況_氏名_扶養親族.disabled = true;
        }
        return event;
    });



})();
