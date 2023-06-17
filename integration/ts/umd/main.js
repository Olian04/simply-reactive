"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var simply_reactive_1 = require("simply-reactive");
var A = (0, simply_reactive_1.createAtom)({
    default: 3,
});
var B = (0, simply_reactive_1.createSelector)({
    get: function () { return A.get() * 2; },
});
(0, chai_1.expect)(B.get()).to.equal(6);
