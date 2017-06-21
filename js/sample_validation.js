
/*
 * 顧客リストの郵便番号、TEL、メールの入力をチェックするサンプルプログラム
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

(function() {
    "use strict";

    //郵便番号の入力チェック
    function zipCheck(event) {
        // 郵便番号の定義(7桁の半角数字)
        var zip_pattern = /^\d{7}$/;
        // event よりレコード情報を取得します
        var rec = event['record'];
        //エラーの初期化
        rec['Zipcode']['error'] = null;
        // 郵便番号が入力されていたら、入力値を確認します
        var zip_value = rec['Zipcode']['value'];
        if (zip_value) {
            if (zip_value.length > 0) {
              // 定義したパターンにマッチするか確認します
                if (!(zip_value.match(zip_pattern))) {
                  // マッチしない場合は、郵便番号フィールドにエラーの内容を表示するようにします
                    rec['Zipcode']['error'] = '7桁の半角数字で入力して下さい';
                }
            }
        }
    }

    //電話番号の入力チェック
    function telCheck(event) {
        // TELの定義(10桁または 11桁の半角数字)
        var tel_pattern = /^\d{10,11}$/;
        // event よりレコード情報を取得します
        var rec = event['record'];
        //エラーの初期化
        rec['TEL']['error'] = null;

        // TEL が入力されていたら、入力値を確認します
        var tel_value = rec['TEL']['value'];
        if (tel_value) {
            if (tel_value.length > 0) {
              // 定義したパターンにマッチするか確認します
                if (!(tel_value.match(tel_pattern))) {
                    // マッチしない場合は、TEL に対してエラーの内容を記載します
                    rec['TEL']['error'] = '10桁 または 11桁の半角数字で入力して下さい';
                }
            }
        }
    }

    //FAXの入力チェック
    function faxCheck(event) {
        // FAXの定義(10桁または 11桁の半角数字)
        var fax_pattern = /^\d{10,11}$/;
        // event よりレコード情報を取得します
        var rec = event['record'];
        //エラーの初期化
        rec['FAX']['error'] = null;
        // FAX が入力されていたら、入力値を確認します
        var fax_value = rec['FAX']['value'];
        if (fax_value) {
            if (fax_value.length > 0) {
                // 定義したパターンにマッチするか確認します
                if (!(fax_value.match(fax_pattern))) {
                    // マッチしない場合は、FAX に対してエラーの内容を記載します
                    rec['FAX']['error'] = '10桁 または 11桁の半角数字で入力して下さい';
                }
            }
        }
    }

    //メールアドレスの入力チェック
    function mailCheck(event) {
        // メールアドレスの定義 (簡易的な定義です。さらに詳細に定義する場合は下記の値を変更して下さい)
        var mail_pattern = /^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/;
        // event よりレコード情報を取得します
        var rec = event['record'];
        //エラーの初期化
        rec['Mail']['error'] = null;
        // メールアドレスが入力されていたら、入力値を確認します
        var mail_value = rec['Mail']['value'];
        if (mail_value) {
            if (mail_value.length > 0) {
                // 定義したパターンにマッチするか確認します
                if (!(mail_value.match(mail_pattern))) {
                    // マッチしない場合は、メールアドレスに対してエラーの内容を記載します
                    rec['Mail']['error'] = 'メールアドレスとして認識されませんでした。値を確認して下さい。';
                }
            }
        }
    }

    //変更イベント（郵便番号)
    kintone.events.on(['app.record.create.change.Zipcode',
                      'app.record.edit.change.Zipcode',
                      'app.record.index.edit.change.Zipcode'], function(event) {
                            zipCheck(event);
                            return event;
                        });

    //変更イベント(電話番号)
    kintone.events.on(['app.record.create.change.TEL',
                      'app.record.edit.change.TEL',
                      'app.record.index.edit.change.TEL'], function(event) {
                            telCheck(event);
                            return event;
                        });

    //変更イベント(FAX)
    kintone.events.on(['app.record.create.change.FAX',
                      'app.record.edit.change.FAX',
                      'app.record.index.edit.change.FAX'], function(event) {
                            faxCheck(event);
                            return event;
                        });

    //変更イベント(Mail)
    kintone.events.on(['app.record.create.change.Mail',
                      'app.record.edit.change.Mail',
                      'app.record.index.edit.change.Mail'], function(event) {
                            mailCheck(event);
                            return event;
                        });

    //保存前イベント
    kintone.events.on(['app.record.create.submit',
                      'app.record.edit.submit',
                      'app.record.index.edit.submit'], function(event) {
                            zipCheck(event);
                            telCheck(event);
                            faxCheck(event);
                            mailCheck(event);
                            return event;
                        });
})();
