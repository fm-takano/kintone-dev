(function() {
    "use strict";

    //ステータスが「新規入力」「入力チェック依頼」以外の場合は保存をさせない
    function cancelSave(event) {

        // レコード情報を取得
        var rec = event['record'];

        if (rec['ステータス']['value'] === "新規入力") {
            return event;
        }
        else if (rec['ステータス']['value'].match(/入力チェック依頼/)) {
            return event;
        }
        else{
            //全体を書き込み禁止
            for(var key in rec){
                rec[key]['disabled'] = true;
            }
            //会社不明だったら会社コードを書き込み可能にする
            if (rec['ステータス']['value'] === "会社不明") {
                rec['会社コード']['disabled'] = false;
                rec['会社判明日付']['disabled'] = false;
            }
            //従業員番号が入っていなければ書き込めるようにする
            if(!rec['従業員番号']['value']){
                rec['従業員番号']['disabled'] = false;
                rec['社番判明日付']['disabled'] = false;
            }
        }
    }

    // 編集画面から保存時のイベント
    kintone.events.on('app.record.edit.show', function(event){
        cancelSave(event);
        return event;
    });
})();
