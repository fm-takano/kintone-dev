(function() {
    "use strict";

    //ステータスが「新規入力」「入力チェック依頼」以外の場合は保存をさせない
    function cancelSave(event) {

        var key,elm;
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
            for(key in rec){
                rec[key]['disabled'] = true;
        		//配偶者・扶養親族の「登録対象外」はいつでも入力できるようにする
                if(key.match(/登録対象外/)){
                    rec[key]['disabled'] = false;
                }
            }
            //会社不明だったら会社コードを書き込み可能にする
            if (rec['ステータス']['value'] === "会社不明") {
                rec['会社コード']['disabled'] = false;
                rec['会社判明日付']['disabled'] = false;
            }
            //社番不明だったら社員番号を書き込めるようにする
            if(rec['ステータス']['value'].match(/不備有/) || rec['ステータス']['value'].match(/社番不明/) ){
                for(elm in rec['不備内容']['value']){
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
		//初期収集対象についてもいつでも入力できるようにする
		rec['初期収集対象']['disabled']=false;
		//配偶者・扶養親族の「登録対象外」はいつでも入力できるようにする
		////ここで個別に入力可にするのではなく、入力不可としているループ中で対応する。
		
		return event;
    }

    // 編集画面から保存時のイベント
    kintone.events.on('app.record.edit.show', function(event){
        cancelSave(event);
        return event;
    });
})();
