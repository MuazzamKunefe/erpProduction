odoo.define('custom-button.custom_button', function (require) {
"use strict";
var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');



    
screens.NumpadWidget.include({  
        applyAccessRights: function() {
            console.log("hi i'm 2 ");
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
    
    
        screens.ActionpadWidget.include({
            
        renderElement: function() {
            console.log("hi i'm 3 ");
        var self = this;
        this._super();
        this.$('.pay').click(function(){
            var order = self.pos.get_order();
            var has_valid_product_lot = _.every(order.orderlines.models, function(line){
                return line.has_valid_product_lot();
            });
            //var user = self.pos.get_cashier();
            var cashier = self.pos.get('cashier') || self.pos.get_cashier();
            console.log("cashier=",cashier)
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
    },
});
    





});