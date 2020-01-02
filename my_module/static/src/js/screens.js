odoo.define('custom-button.custom_button', function (require) {
"use strict";
var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');


screens.NumpadWidget.inclue({
    
    applyAccessRights: function() {
        console.log("hi i'mmmmmmmmm ");
        var cashier = this.pos.get('cashier') || this.pos.get_cashier();
        var has_price_control_rights = !this.pos.config.restrict_price_control || cashier.role == 'manager';
        this.$el.find('.mode-button[data-mode="price"]')
            .toggleClass('disabled-mode', !has_price_control_rights)
            .prop('disabled', !has_price_control_rights);
        if (!has_price_control_rights && this.state.get('mode')=='price'){
            this.state.changeMode('quantity');
        }
    },
       
    },
    
});
    
console.log("hi i'm ",screens);





});