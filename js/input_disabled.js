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
            //社番不明だったら社員番号を書き込めるようにする
            if(rec['ステータス']['value'].match(/不備有/) ){
                for(var elm in rec['不備内容']['value']){
                    if(rec['不備内容']['value'][elm] === "社番不明"){
                        rec['従業員番号']['disabled'] = false;
                        rec['社番判明日付']['disabled'] = false;
                    }
                }
            }
        }
        //廃棄日は入力されていなかったらいつでも入れられるようにする
        if(!rec['廃棄日付']['value']){
            rec['廃棄日付']['disabled']=false;
        }
		//2回目の提出の場合はいつでも入れられるようにする
		rec['２回目提出']['disabled']=false;
		rec['２回目提出_初回日付']['disabled']=false;
    }

    // 編集画面から保存時のイベント
    kintone.events.on('app.record.edit.show', function(event){
        cancelSave(event);
        return event;
    });
})();
