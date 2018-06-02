"use strict";

var Record = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.address = obj.address;
        this.submitTime = obj.submitTime;
        this.point = obj.point;
    } else {
        this.id = 0;
        this.address = "";
        this.submitTime = "";
        this.point = 0;
    }

};

Record.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TetrisContract = function () {
    LocalContractStorage.defineMapProperty(this, "records", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (text) {
            return new Record(text);
        }
    });

    LocalContractStorage.defineProperty(this, "size");

};

TetrisContract.prototype = {
    init: function () {
        this.size = 0;
    },
    get:function (index) {
        return this.records.get(index);
    },
    getHighPoint: function () {
        var highPoint = 0;
        var addr = Blockchain.transaction.from;
        for(var i=0; i<this.size; i++){
            var record = this.records.get(i);
            if(record.address == addr){
                if(record.point > highPoint){
                    highPoint = record.point;
                }
            }
        }
        var record = new Record();
        record.address = addr;
        record.point = highPoint;
        return record;
    },
    getRankingList: function (num) {
        //取所有记录的前N名
        var result  = [];
        var arr = new Array();
        for(var i=0; i<this.size; i++){
            arr.push(this.records.get(i));
        }
        for(var i=0; i<arr.length; i++){
            for(var j=i+1; j<arr.length; j++){
                if(parseInt(arr[i].point) < parseInt(arr[j].point)){
                    var t = arr[i];
                    arr[i] = arr[j];
                    arr[j] = t;
                }
            }
        }
        for(var i=0; i<num; i++){
            var object = arr[i];
            result.push(object);
        }
        return JSON.stringify(result);
    },
    setRocord: function(point, submitTime){
        var addr = Blockchain.transaction.from;
        var newRecord = new Record();
        newRecord.id = this.size;
        newRecord.address = addr;
        newRecord.submitTime = submitTime;
        newRecord.point = point;
        this.records.set(this.size, newRecord);
        this.size += 1;
    },
    getLen :function () {
        return this.size;
    }
};

module.exports = TetrisContract;