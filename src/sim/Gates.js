"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gate = exports.availableGates = void 0;
exports.availableGates = {
    AND: {
        in: 2,
        out: 1,
        logic: function (ins) { return ins[0] && ins[1]; },
    },
    OR: {
        in: 2,
        out: 1,
        logic: function (ins) { return ins[0] || ins[1]; },
    },
    XOR: {
        in: 2,
        out: 1,
        logic: function (ins) { return !(ins[0] == ins[1]); },
    },
    BUFFER: {
        in: 1,
        out: 1,
        logic: function (ins) { return ins[0]; },
    },
    NOT: {
        in: 1,
        out: 1,
        logic: function (ins) { return !ins[0]; },
    },
};
var Gate = /** @class */ (function () {
    function Gate(name, inCount, outLogicFuncs) {
        this.name = name;
        this.inCount = inCount;
        this.inputs = new Array(inCount).fill(null);
        this.inputsIndex = new Array(inCount).fill(null);
        this.outCount = outLogicFuncs.length;
        this.outLogicFuncs = outLogicFuncs;
        this.outputCaches = new Array(this.outCount).fill(false);
        this.outputCallbacks = [];
        for (var i = 0; i < this.outCount; i++)
            this.outputCallbacks.push({});
    }
    Gate.prototype.fetchAllInputs = function () {
        var ins = [];
        for (var i = 0; i < this.inCount; i++) {
            var inputGate = this.inputs[i], index = this.inputsIndex[i];
            if (inputGate) {
                if (index == null)
                    throw "Index not found for Gate";
                else
                    ins.push(inputGate.fetchOutput(index));
            }
            else
                ins.push(false);
        }
        return ins;
    };
    Gate.prototype.fetchOutput = function (index) {
        return this.outputCaches[index];
    };
    Gate.prototype.fetchAllOutput = function () {
        var outs = [];
        for (var i = 0; i < this.outCount; i++)
            outs.push(this.fetchOutput(i));
        return outs;
    };
    Gate.prototype.computeOutput = function () {
        var inputValues = this.fetchAllInputs();
        for (var i = 0; i < this.outCount; i++) {
            var val = this.outLogicFuncs[i](inputValues);
            for (var hash in this.outputCallbacks[i])
                this.outputCallbacks[i][hash](val);
            this.outputCaches[i] = val;
        }
    };
    Gate.prototype.setOutputCallback = function (index, hash, callback) {
        if (index < 0 || index >= this.outCount)
            throw "cannot setOutputCallback for " + index;
        this.outputCallbacks[index][hash] = callback;
    };
    Gate.prototype.removeOutputCallback = function (index, hash) {
        if (index < 0 || index >= this.outCount)
            throw "cannot removeOutputCallback for " + index;
        if (this.outputCallbacks[index][hash])
            delete this.outputCallbacks[index][hash];
        else
            throw "cannot removeOutputCallback for hash " + hash;
    };
    Gate.prototype.setInput = function (asIndex, inputGate, gateIndex) {
        if (asIndex < 0 || asIndex >= this.inCount)
            throw "cannot setInput for " + asIndex;
        if (this.inputsIndex[asIndex] != null)
            return false;
        this.inputs[asIndex] = inputGate;
        this.inputsIndex[asIndex] = gateIndex;
        return true;
    };
    Gate.prototype.removeInput = function (index) {
        if (index < 0 || index >= this.inCount)
            throw "cannot removeInput for " + index;
        this.inputsIndex[index] = null;
        this.inputs[index] = null;
    };
    return Gate;
}());
exports.Gate = Gate;
