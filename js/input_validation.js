(function() {
    "use strict";

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
                    if (companyCode.substr(0, 3) == 'STE' && empCode.length == 9) {
                        //STEは9桁がある
                    }
                    else {
                        rec['従業員番号']['error'] = '従業員番号の長さを確認してください';
                    }
                }
            }
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

    kintone.events.on(['app.record.create.change.従業員番号',
        'app.record.edit.change.従業員番号',
        'app.record.index.edit.change.従業員番号'
    ], function(event) {
        empCodeCheck(event);
        invalidCheck(event);
        mnEvidenceCheck(event);

        return event;
    });


    // before save
    kintone.events.on(['app.record.create.submit',
        'app.record.edit.submit',
        'app.record.index.edit.submit'
    ], function(event) {
        empCodeCheck(event);
        invalidCheck(event);
        mnEvidenceCheck(event);

        return event;
    });
})();