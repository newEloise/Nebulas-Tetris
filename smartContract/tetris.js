"use strict";

var Record = function (address, point) {
    if (this.verifyAddress(address)) {
        this.address = address;
        this.timestamp = Blockchain.transaction.timestamp;
        this.point = point;
    } else if (address !== null || address !== "" || address !== undefined) {
        let o = JSON.parse(address);
        this.address = o.address;
        this.timestamp = o.timestamp;
        this.point = o.point;
    }

};

Record.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    verifyAddress: function (address) {
        let result = Blockchain.verifyAddress(address);
        return result === 0 ? false : true;
    }
};

var TetrisContract = function () {
    LocalContractStorage.defineMapProperty(this, "records", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new Record(str);
        }
    });

    LocalContractStorage.defineProperties(this, {
        worldRecord: {
            stringify: function (obj) {
                return obj.toString();
            },
            parse: function (str) {
                return new Record(str);
            }
        },
        adminAddress: null
    });

};

TetrisContract.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;

        return this.gameOver(100000)
    },
    getRecord: function () {
        const addr = Blockchain.transaction.from;
        let record = this.records.get(addr);
        if (record instanceof Record) {
            return record;
        } else {
            throw new Error("尚无挑战记录");
        }
    },
    getWorldRecord: function () {
        let worldRecord = this.worldRecord;
        if (worldRecord instanceof Record) {
            return worldRecord;
        } else {
            throw new Error("尚无世界纪录");
        }
    },
    gameOver: function (point) {
        const addr = Blockchain.transaction.from;
        let newRecord = new Record(addr, point);
        Blockchain.transfer(this.adminAddress, new BigNumber(0.0001));
        Event.Trigger('transfer', {
            Transfer: {
                from: addr,
                to: this.adminAddress,
                value: new BigNumber(0.0001)
            }
        });
        this._setWorldRecord(newRecord);
        this._setRecord(newRecord);
        let oldRecord = this.records.get(addr);
        if (oldRecord instanceof Record) {
            if (parseInt(point) > parseInt(oldRecord)) {
                this.records.set(addr, newRecord);
            }
        } else {
            this.records.set(addr, newRecord);
        }
        return this.records.get(addr);
    },
    _setRecord: function (record) {
        const addr = Blockchain.transaction.from;
        let oldRecord = this.records.get(addr);
        if (oldRecord instanceof Record) {
            if (parseInt(record.point) > parseInt(oldRecord.point)) {
                this.records.set(addr, record);
            }
        }
        return this.records.get(addr);
    },
    _setWorldRecord: function (record) {
        let worldRecord = this.worldRecord;
        if (worldRecord instanceof Record) {
            if (record instanceof Record) {
                if (parseInt(record.point) > parseInt(this.worldRecord.point)) {
                    this.worldRecord = record
                }
            } else {
                throw new Error("record格式错误")
            }
        } else {
            this.worldRecord = record;
        }
        return this.worldRecord;

    },
    revival: function () {
        try {
            const addr = Blockchain.transaction.from;
            Blockchain.transfer(this.adminAddress, new BigNumber(0.001));
            Event.Trigger('transfer', {
                Transfer: {
                    from: addr,
                    to: this.adminAddress,
                    value: new BigNumber(0.001)
                }
            });
            return {"payed": true};
        } catch (e) {
            return {"payed": false};
        }

    },
    setAdminAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Admin only");
        }
    },
    takeout: function (value) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, value);
            Event.Trigger("transfer", {
                Transfer: {
                    to: this.adminAddress,
                    value: value
                }
            })
        } else {
            throw new Error("Admin only");
        }

    }
};

module.exports = TetrisContract;