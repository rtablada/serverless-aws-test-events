"use strict";
exports.__esModule = true;
var AwsTestEventsPlugin = /** @class */ (function () {
    function AwsTestEventsPlugin() {
        this.hooks = {};
        this.commands = {
            'generate-events': {}
        };
        console.log('constructed');
    }
    return AwsTestEventsPlugin;
}());
exports["default"] = AwsTestEventsPlugin;
