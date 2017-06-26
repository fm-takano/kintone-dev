(function(){
    "use strict";
    
    kintone.events.on(['app.record.detail.show','app.record.edit.show'],function(event){
        var rec = event.record;
        //扶養親族氏名に名前があったら開く
        var countName = 0;
        for(var key in rec){
            if(key.match(/氏名_扶養/)){
                if(rec[key].value){
                    countName++;
                }
            }
        }
        if(countName > 0 ){
            kintone.app.record.setGroupFieldOpen('扶養親族グループ',true);
        }
    });
    
})();