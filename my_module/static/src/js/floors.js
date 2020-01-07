odoo.define('custom-time.custom_time', function (require) {
"use strict";

var floors = require('pos_restaurant.floors');

floors.set_idle_timer.include(
 set_idle_timer: function(deactivate, timeout) {
        timeout = timeout || 20000;
        deactivate = deactivate || false;
        if (this.idle_timer) {
            clearTimeout(this.idle_timer);
        }
        var self = this;
        if (deactivate) {
            clearTimeout(this.idle_timer);
        } else {
            this.idle_timer = setTimeout(function(){self.set_table(null)}, timeout);
        }
    },

);
    





});