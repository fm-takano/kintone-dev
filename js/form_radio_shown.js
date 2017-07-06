(function() {
    "use strict";

    //ラジオボタンによって表示グループを変更する
    function formShown(event) {

        // レコード情報を取得
        var rec = event['record'];
        
        // ラジオボタンの設定値を取得
        var radioVal = rec['申請種別']['value'];
        
        //全てのグループを閉じる
        kintone.app.record.setFieldShown('削除', false);
        kintone.app.record.setFieldShown('従業員番号変更', false);
        kintone.app.record.setFieldShown('氏名変更', false);

        //必要なものだけ開く
        kintone.app.record.setFieldShown(radioVal, true);
        kintone.app.record.setGroupFieldOpen(radioVal, true);

        return event;
    }

    // イベント発生時の処理
    var eventList = [
        'app.record.create.shwow',
        'app.record.edit.show',
        'app.record.index.edit.show',
        'app.record.index.show',
        'app.record.detail.show',
        'app.record.create.change.申請種別',
        'app.record.edit.change.申請種別',
        ];

    kintone.events.on(eventList, function(event){
        formShown(event);
        return event;
    });
})();
