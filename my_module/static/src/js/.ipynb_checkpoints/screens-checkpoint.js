odoo.define('custom-button.custom_button', function (require) {
"use strict";
var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');


screens.NumpadWidget.inclue({
    
        applyAccessRights: function() {
        var cashier = this.pos.get('cashier') || this.pos.get_cashier();
        var has_price_control_rights = !this.pos.config.restrict_price_control || cashier.role == 'manager';
        this.$el.find('.mode-button[data-mode="price"]')
            .toggleClass('disabled-mode', !has_price_control_rights)
            .prop('disabled', !has_price_control_rights);
        if (!has_price_control_rights && this.state.get('mode')=='price'){
            this.state.changeMode('quantity');
        }
        if( !cashier.name.includes('cshr') && cashier.role !== 'manager'){
            //Disable discount on item
            this.$el.find('.mode-button[data-mode="discount"]')
            .toggleClass('disabled-mode', true)
            .prop('disabled', true);
            //Disable Remove Item from Order
            this.$el.find('.numpad-backspace')
            .toggleClass('disabled-mode', true)
            .prop('disabled', true);
            //Disable returm
            this.$('.numpad-minus')
            .toggleClass('disabled-mode', true)
            .prop('disabled', true);
        }else{
            //Enable discount on item
            this.$el.find('.mode-button[data-mode="discount"]')
            .toggleClass('disabled-mode', false)
            .prop('disabled', false);
             //Enable Remove Item from Order
            this.$el.find('.numpad-backspace')
            .toggleClass('disabled-mode', false)
            .prop('disabled', false);

             //Enable returm
             this.$('.numpad-minus')
             .toggleClass('disabled-mode', false)
             .prop('disabled', !false);
        }
       
    },
    
});
    
console.log("hi i'm ",screens);





});