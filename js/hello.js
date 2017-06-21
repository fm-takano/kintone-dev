(function(){
    "use strict";
    kintone.events.on('app.record.detail.show',function(event){
        var now = new Date();
        window.alert('hello, kintone' + ':' + now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate());
    });
})();