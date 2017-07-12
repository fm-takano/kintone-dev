(function() {
    'use strict';

    //レコードの追加、編集、詳細画面で、フィールドの表示非表示を切り替える
    var eventList = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.detail.show',
        'app.record.create.change.ドロップダウン',
        'app.record.edit.change.ドロップダウン',
    ];

    kintone.events.on(eventList, function(event) {
        var record = event.record;
        var result = record['ドロップダウン'].value;
        //受注確度で「受注」が選択された場合のみ受注金額フィールドを表示する
        if (result === '受注') {
            kintone.app.record.setFieldShown('数値', true);
        }
        else {
            kintone.app.record.setFieldShown('数値', false);
        }
    });

    // レコード保存実行時に、アラート表示する
    var eventSubmit = [
        'app.record.create.submit',
        'app.record.edit.submit',
    ];
    
    kintone.events.on(eventSubmit, function(event) {
        // window.alert('登録ありがとうございます！商談ごとに記録を残してください');
        var result = confirm('登録してもいいですか？');
        if(result){
            return true;
        }else{
            return false;
        }
    });

    
})();
