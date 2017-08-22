(function() {
    "use strict";

    //
    // 入力項目制御
    //

    //ステータスが「新規入力」「入力チェック依頼」以外の場合は入力できる項目を制限する
    function disabledInputField(event) {

        var key, elm;
        // レコード情報を取得
        var rec = event['record'];

        if (rec['ステータス']['value'] === "新規入力") {
            return event;
        }
        else if (rec['ステータス']['value'].match(/入力チェック依頼/)) {
            return event;
        }
        else {
            //全体を書き込み禁止
            for (key in rec) {
                rec[key]['disabled'] = true;
                //配偶者・扶養親族の「登録対象外」はいつでも入力できるようにする
                if (key.match(/登録対象外/)) {
                    rec[key]['disabled'] = false;
                }
            }
            //会社不明だったら会社コードを書き込み可能にする
            if (rec['ステータス']['value'] === "会社不明") {
                rec['会社コード']['disabled'] = false;
                rec['会社判明日付']['disabled'] = false;
            }
            //社番不明だったら社員番号を書き込めるようにする
            if (rec['ステータス']['value'].match(/不備有/) || rec['ステータス']['value'].match(/社番不明/)) {
                for (elm in rec['不備内容']['value']) {
                    if (rec['不備内容']['value'][elm] === "社番不明") {
                        rec['従業員番号']['disabled'] = false;
                        rec['社番判明日付']['disabled'] = false;
                    }
                }
            }
        }
        //廃棄日は入力されていなかったらいつでも入れられるようにする
        if (!rec['廃棄日付']['value']) {
            rec['廃棄日付']['disabled'] = false;
        }
        //不備対応かどうか、はいつでも入れられるようにする
        rec['不備対応']['disabled'] = false;
        rec['不備対応_日付']['disabled'] = false;
        //2回目の提出の場合はいつでも入れられるようにする
        rec['２回目提出']['disabled'] = false;
        rec['２回目提出_初回日付']['disabled'] = false;
        //初期収集対象についてもいつでも入力できるようにする
        rec['初期収集対象']['disabled'] = false;
        //配偶者・扶養親族の「登録対象外」はいつでも入力できるようにする
        ////ここで個別に入力可にするのではなく、入力不可としているループ中で対応する。

        return event;
    }

    // 編集画面から保存時のイベント
    kintone.events.on('app.record.edit.show', function(event) {
        disabledInputField(event);
        return event;
    });


    //
    // 扶養親族欄の表示制御。入力されている場合はフィールドを展開する
    //
    
    kintone.events.on(['app.record.detail.show','app.record.edit.show'],function(event){
        openFamilyInputField(event);
        return event;
    });
    function openFamilyInputField(event){
        var rec = event.record;
        //扶養親族氏名に名前があったら開く
        var countName = 0;
        var key;
        for(key in rec){
            if(key.match(/氏名_扶養/)){
                if(rec[key].value){
                    countName += 1;
                }
            }
        }
        if(countName > 0 ){
            kintone.app.record.setGroupFieldOpen('扶養親族グループ',true);
        }
        return event;
    }
    
    //
    // 入力内容チェック
    //

    // 従業員番号チェック
    function empCodeCheck(event) {
        var rec = event['record'];
        rec['従業員番号']['error'] = null;

        var companyCode = rec['会社コード']['value'];
        var empCode = rec['従業員番号']['value'];
        if (empCode) {
            if (empCode.length > 0) {
                //会社コードの比較
                if (empCode.substr(0, 3) != companyCode.substr(0, 3)) {
                    rec['従業員番号']['error'] = '会社コードが一致していません';
                }
                else if (empCode.length != 10) {
                    //10桁なければエラー
                    if (companyCode.substr(0, 3) === 'STE' && empCode.length === 9) {
                        //STEは9桁がある
                    }
                    else {
                        rec['従業員番号']['error'] = '従業員番号の長さを確認してください';
                    }
                }
            }
        }
    }
    
    //氏名フィールドの長さチェック
    function lengthCheck(event){
        var rec = event['record'];
        var name = rec['氏名_本人']['value'];
        rec['氏名_本人']['error'] = null;
        if(name.length > 30 ){
            rec['氏名_本人']['error'] = '30文字を超えています(' + name.length +'文字)'; 
        }
    }

    // 不備のチェック
    function invalidCheck(event) {
        var rec = event['record'];
        rec['不備内容']['error'] = null;
        var errorMessage = new Array();
        var fubiNaiyoValue = '';
        var i;

        //不備対応、マイファンドだったらチェックなし
        var fubiTaio = rec['不備対応']['value'];
        if (rec['種別']['value'] != 'マイファンド' && (fubiTaio == null || !fubiTaio.match(/不備対応/))) {

            //■対応①：個人番号カードのチェックの確認
            var countMnCard = 0;
            for (var keyString in rec) {
                if (keyString.match(/番号確認資料/)) {
                    for (i = 0; i < rec[keyString]['value'].length; i++) {
                        if (rec[keyString]['value'][i].match(/対応①/)) {
                            countMnCard++;
                        }
                    }
                }
            }
            if (countMnCard > 0) {
                //エラーの可能性がある
                errorMessage.push('対応①の不備があります');

                //ループを回す
                for (fubiNaiyoValue in rec['不備内容']['value']) {
                    if (rec['不備内容']['value'][fubiNaiyoValue].match(/対応①/)) {
                        //ちゃんと不備として判断している
                        errorMessage.pop();
                    }
                }
            }

            //■対応②、対応③：本人確認資料の有無
            //本人（従業員、個人事業主）以外はチェックしない
            if (rec['種別']['value'] == '従業員' || rec['種別']['value'] == '個人事業主') {
                var countIDCard = 0;
                countIDCard += rec['本人確認資料_顔あり']['value'].length * 2;
                countIDCard += rec['本人確認資料_顔なし']['value'].length;
                if (countIDCard === 0) {
                    errorMessage.push('対応③の不備があります');
                    //対応②
                    for (fubiNaiyoValue in rec['不備内容']['value']) {
                        if (rec['不備内容']['value'][fubiNaiyoValue].match(/対応③/)) {
                            //ちゃんと不備として判断している
                            errorMessage.pop();
                        }
                    }
                }
                else if (countIDCard === 1) {
                    errorMessage.push('対応②の不備があります');
                    //対応③
                    for (fubiNaiyoValue in rec['不備内容']['value']) {
                        if (rec['不備内容']['value'][fubiNaiyoValue].match(/対応②/)) {
                            //ちゃんと不備として判断している
                            errorMessage.pop();
                        }
                    }
                }
            }

            //■社員番号不明
            if (!rec['従業員番号']['value']) {
                errorMessage.push('従業員番号不明です');
                //社員番号不明
                for (fubiNaiyoValue in rec['不備内容']['value']) {
                    if (rec['不備内容']['value'][fubiNaiyoValue].match(/社番不明/)) {
                        //ちゃんと不備として判断している
                        errorMessage.pop();
                        //社番不明のときに、生年月日が入っていない場合
                        if(!rec['生年月日']['value']){
                            rec['生年月日']['error']= '入力されていません';
                        }else{
                            rec['生年月日']['error']=null;
                        }
                    }
                }
            }
            
            //■会社不明
            if (!rec['会社コード']['value']) {
                errorMessage.push('会社不明です');
                //会社不明
                for (fubiNaiyoValue in rec['不備内容']['value']) {
                    if (rec['不備内容']['value'][fubiNaiyoValue].match(/会社不明/)) {
                        //ちゃんと不備として判断している
                        errorMessage.pop();
                    }
                }
            }

            if (errorMessage.length > 0) {
                rec['不備内容']['error'] = errorMessage;
            }
        }
    }

    // 番号確認資料のチェック状況確認
    function mnEvidenceCheck(event) {
        var rec = event['record'];

        var keyString = '';
        //番号確認資料のエラーの初期化
        for (keyString in rec) {
            if (keyString.match(/番号確認資料/)) {
                rec[keyString]['error'] = null;
            }
        }

        //不備対応、マイファンドだったらチェックなし
        var fubiTaio = rec['不備対応']['value'];
        if (rec['種別']['value'] != 'マイファンド' && (fubiTaio == null || !fubiTaio.match(/不備対応/))) {
            for (keyString in rec) {
                if (keyString.match(/番号確認資料/)) {
                    //扶養増かつ本人は除外
                    if (rec['種別']['value'] === '扶養増' && keyString.substr(keyString.indexOf('_')) === '_本人') {

                    }
                    else if (rec[keyString]['value'].length == 0 && rec['氏名' + keyString.substr(keyString.indexOf('_'))]['value']) {
                        rec[keyString]['error'] = '入力値が足りません';
                    }
                }
            }
        }

    }
    
    //編集画面で社番不明が判明した時の処理
    function proveEmpCode(event){
        var rec = event['record'];
        rec['社番判明日付']['error']=null;

        //社番不明
        var fubiNaiyoValue;
        for (fubiNaiyoValue in rec['不備内容']['value']) {
            if (rec['不備内容']['value'][fubiNaiyoValue].match(/社番不明/)) {
                //社番不明にチェックが入っている
                rec['社番判明日付']['error']='判明日付を入れてください';
            }                
        }
        //従業員番号と判明日付が入っている、どちらも入っていない
        if(rec['従業員番号']['value'] && rec['社番判明日付']['value']){
            rec['社番判明日付']['error']=null;
        }else if(!rec['従業員番号']['value'] && !rec['社番判明日付']['value']){
            rec['社番判明日付']['error']=null;
        }
    }

    //編集画面で会社不明が判明した時の処理
    function proveCompnyCode(event){
        var rec = event['record'];
        rec['会社判明日付']['error']=null;

        //会社不明
        var fubiNaiyoValue;
        for (fubiNaiyoValue in rec['不備内容']['value']) {
            //会社不明にチェックが入っている
            if (rec['不備内容']['value'][fubiNaiyoValue].match(/会社不明/)) {
                rec['会社判明日付']['error']='判明日付を入れてください';
            }                
        }
        //会社コードと判明日付が入っている、どちらも入っていない
        if(rec['会社コード']['value'] && rec['会社判明日付']['value']){
            rec['会社判明日付']['error']=null;
        }else         if(!rec['会社コード']['value'] && !rec['会社判明日付']['value']){
            rec['会社判明日付']['error']=null;
        }
    }

    kintone.events.on(['app.record.create.change.従業員番号',
        'app.record.edit.change.従業員番号',
        'app.record.index.edit.change.従業員番号'
    ], function(event) {
        empCodeCheck(event);
        //invalidCheck(event);
        //mnEvidenceCheck(event);

        return event;
    });
    
    // 氏名の長さチェック
    kintone.events.on(['app.record.create.change.氏名_本人',
        'app.record.edit.change.氏名_本人',
        'app.record.index.edit.change.氏名_本人'
    ], function(event) {
        lengthCheck(event);
        return event;
    });

    kintone.events.on([
        'app.record.create.change.不備内容',
        'app.record.edit.change.不備内容',
        'app.record.index.edit.change.不備内容',
        'app.record.create.change.氏名_本人',
        'app.record.edit.change.氏名_本人',
        'app.record.index.edit.change.氏名_本人',
        'app.record.create.change.番号確認資料_本人',
        'app.record.edit.change.番号確認資料_本人',
        'app.record.index.edit.change.番号確認資料_本人',
        'app.record.create.change.本人確認資料_顔あり',
        'app.record.edit.change.本人確認資料_顔あり',
        'app.record.index.edit.change.本人確認資料_顔あり',
        'app.record.create.change.本人確認資料_顔なし',
        'app.record.edit.change.本人確認資料_顔なし',
        'app.record.index.edit.change.本人確認資料_顔なし',
        'app.record.index.edit.change.種別',
        'app.record.create.change.生年月日',
        'app.record.edit.change.生年月日',
        'app.record.index.edit.change.生年月日',
        ], function(event) {
        empCodeCheck(event);
        invalidCheck(event);
        mnEvidenceCheck(event);

        return event;
    });
    
    //編集画面で社番を変更
    kintone.events.on(['app.record.edit.change.従業員番号',
    'app.record.index.edit.change.従業員番号',
    'app.record.edit.change.社番判明日付',
    'app.record.index.edit.change.社番判明日付'
    ],function(event){
        proveEmpCode(event);
        return event;
    });

    //編集画面で会社コードを変更
    kintone.events.on(['app.record.edit.change.会社コード',
    'app.record.index.edit.change.会社コード',
    'app.record.edit.change.会社コード',
    'app.record.index.edit.change.会社コード'
    ],function(event){
        proveCompnyCode(event);
        return event;
    });
    
    //編集画面の保存前処理
    kintone.events.on(['app.record.edit.submit','app.record.index.edit.submit'],function(event){
        proveEmpCode(event);
        proveCompnyCode(event);
        return event;
        
    });


    // before save
    kintone.events.on(['app.record.create.submit',
        'app.record.edit.submit',
        'app.record.index.edit.submit'
    ], function(event) {
        empCodeCheck(event);
        lengthCheck(event);
        invalidCheck(event);
        mnEvidenceCheck(event);

        return event;
    });
})();
