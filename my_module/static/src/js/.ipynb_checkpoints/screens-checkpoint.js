odoo.define('point_of_sale.screens', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
    

    var NumpadWidget = PosBaseWidget.extend({
    template:'NumpadWidget',
    init: function(parent) {
        this._super(parent);
        this.state = new models.NumpadState();
    },
    start: function() {
        this.applyAccessRights();
        this.state.bind('change:mode', this.changedMode, this);
        this.pos.bind('change:cashier', this.applyAccessRights, this);
        this.changedMode();
        this.$el.find('.numpad-backspace').click(_.bind(this.clickDeleteLastChar, this));
        this.$el.find('.numpad-minus').click(_.bind(this.clickSwitchSign, this));
        this.$el.find('.number-char').click(_.bind(this.clickAppendNewChar, this));
        this.$el.find('.mode-button').click(_.bind(this.clickChangeMode, this));
    },
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
    clickDeleteLastChar: function() {
        return this.state.deleteLastChar();
    },
    clickSwitchSign: function() {
        return this.state.switchSign();
    },
    clickAppendNewChar: function(event) {
        var newChar;
        newChar = event.currentTarget.innerText || event.currentTarget.textContent;
        return this.state.appendNewChar(newChar);
    },
    clickChangeMode: function(event) {
        var newMode = event.currentTarget.attributes['data-mode'].nodeValue;
        return this.state.changeMode(newMode);
    },
    changedMode: function() {
        var mode = this.state.get('mode');
        $('.selected-mode').removeClass('selected-mode');
        $(_.str.sprintf('.mode-button[data-mode="%s"]', mode), this.$el).addClass('selected-mode');
    },
});

    
    var ActionpadWidget = PosBaseWidget.extend({
    template: 'ActionpadWidget',
    init: function(parent, options) {
        var self = this;
        this._super(parent, options);

        this.pos.bind('change:selectedClient', function() {
            self.renderElement();
        });
    },
    renderElement: function() {
        var self = this;
        this._super();
        this.$('.pay').click(function(){
            var order = self.pos.get_order();
            var has_valid_product_lot = _.every(order.orderlines.models, function(line){
                return line.has_valid_product_lot();
            });
            //var user = self.pos.get_cashier();
            var cashier = self.pos.get('cashier') || self.pos.get_cashier();
       
            if(cashier){
                //return user.name;
              
                console.log(cashier);        
                console.log( cashier.name === 'testpos');
                if(cashier.name.includes('cshr')  || cashier.role === 'manager'){
                    if(!has_valid_product_lot){
                        self.gui.show_popup('confirm',{
                            'title': _t('Empty Serial/Lot Number'),
                            'body':  _t('One or more product(s) required serial/lot number.'),
                            confirm: function(){
                                self.gui.show_screen('payment');
                            },
                        });
                    }else{
                        self.gui.show_screen('payment');
                    }
            }else{
                //return "";
                console.log( "Else no permission");        

                console.log( cashier);        
                //Alert("Access denied!");
               
            }
            }


           
        });
        this.$('.set-customer').click(function(){
            self.gui.show_screen('clientlist');
        });
    }
});


});
