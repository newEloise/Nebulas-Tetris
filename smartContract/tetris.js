"use strict";

var Record = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.address = obj.address;
        this.timestamp = Blockchain.transaction.timestamp;
        this.point = obj.point;
    } else {
        this.id = 0;
        this.address = "";
        this.timestamp = "";
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
    getRecord: function () {
        var addr = Blockchain.transaction.from;
        for(var i=0; i<this.size; i++){
            var record = this.records.get(i);
            if(record.address == addr){
                return record;
            }
        }
        var newRecord = new Record();
        newRecord.address = addr;
        newRecord.point = 0;
        return newRecord;
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
                if(arr[i].point > arr[j].point){
                    t = arr[i];
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
    setRocord: function(point){
        var addr = Blockchain.transaction.from;
        var flag = 0;
        for(var i=0; i<this.size; i++){
            var record = this.records.get(i);
            if(record.address == addr){
                if (parseInt(point) > parseInt(record.point)) {
                    var newRecord = new Record();
                    newRecord.id = i;
                    newRecord.address = addr;
                    newRecord.timestamp = Blockchain.transaction.timestamp;
                    newRecord.point = point;
                    this.records.set(i, newRecord);
                    flag = 1;
                    break;
                }
            }
        }
        if(flag == 0){
            var newRecord = new Record();
            newRecord.id = this.size;
            newRecord.address = addr;
            newRecord.timestamp = Blockchain.transaction.timestamp;
            newRecord.point = point;
            this.records.set(this.size, newRecord);
            this.size += 1;
        }
    },
    getLen :function () {
        return this.size;
    }
};

module.exports = TetrisContract;