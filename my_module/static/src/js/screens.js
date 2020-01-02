odoo.define('point_of_sale.screens', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
    

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

    
    
    var ProductScreenWidget = ScreenWidget.extend({
    template:'ProductScreenWidget',

    init: function() {
        this._super.apply(this, arguments);
        this.timeout = null;
        this.buffered_key_events = [];
    },

    start: function(){ 

        var self = this;

        this.actionpad = new ActionpadWidget(this,{});
        this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));

        this.numpad = new NumpadWidget(this,{});
        this.numpad.replace(this.$('.placeholder-NumpadWidget'));

        this.order_widget = new OrderWidget(this,{
            numpad_state: this.numpad.state,
        });
        this.order_widget.replace(this.$('.placeholder-OrderWidget'));

        this.product_list_widget = new ProductListWidget(this,{
            click_product_action: function(product){ self.click_product(product); },
            product_list: this.pos.db.get_product_by_category(0)
        });
        this.product_list_widget.replace(this.$('.placeholder-ProductListWidget'));

        this.product_categories_widget = new ProductCategoriesWidget(this,{
            product_list_widget: this.product_list_widget,
        });
        this.product_categories_widget.replace(this.$('.placeholder-ProductCategoriesWidget'));

        this.action_buttons = {};
        var classes = action_button_classes;
        for (var i = 0; i < classes.length; i++) {
            var classe = classes[i];
            if ( !classe.condition || classe.condition.call(this) ) {
                var widget = new classe.widget(this,{});
                widget.appendTo(this.$('.control-buttons'));
                this.action_buttons[classe.name] = widget;
            }
        }
        if (_.size(this.action_buttons)) {
            this.$('.control-buttons').removeClass('oe_hidden');
        }
        this._onKeypadKeyDown = this._onKeypadKeyDown.bind(this);
    },

    click_product: function(product) {
       if(product.to_weight && this.pos.config.iface_electronic_scale){
           this.gui.show_screen('scale',{product: product});
       }else{
           this.pos.get_order().add_product(product);
       }
    },

    show: function(reset){
        this._super();
        if (reset) {
            this.product_categories_widget.reset_category();
            this.numpad.state.reset();
        }
        if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
            this.chrome.widget.keyboard.connect($(this.el.querySelector('.searchbox input')));
        }
        $(document).on('keydown.productscreen', this._onKeypadKeyDown);
    },
    close: function(){
        this._super();
        if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
            this.chrome.widget.keyboard.hide();
        }
        $(document).off('keydown.productscreen', this._onKeypadKeyDown);
    },

    /**
     * Buffers the key typed and distinguishes between actual keystrokes and
     * scanner inputs.
     *
     * @private
     * @param {event} ev - The keyboard event.
    */
    _onKeypadKeyDown: function (ev) {
        //prevent input and textarea keydown event
        if(!_.contains(["INPUT", "TEXTAREA"], $(ev.target).prop('tagName'))) {
            clearTimeout(this.timeout);
            this.buffered_key_events.push(ev);
            this.timeout = setTimeout(_.bind(this._handleBufferedKeys, this), BarcodeEvents.max_time_between_keys_in_ms);
        }
    },

    /**
     * Processes the buffer of keys filled by _onKeypadKeyDown and
     * distinguishes between the actual keystrokes and scanner inputs.
     *
     * @private
    */
    _handleBufferedKeys: function () {
        // If more than 2 keys are recorded in the buffer, chances are high that the input comes
        // from a barcode scanner. In this case, we don't do anything.
        if (this.buffered_key_events.length > 2) {
            this.buffered_key_events = [];
            return;
        }

        for (var i = 0; i < this.buffered_key_events.length; ++i) {
            var ev = this.buffered_key_events[i];
            if ((ev.key >= "0" && ev.key <= "9") || ev.key === ".") {
               this.numpad.state.appendNewChar(ev.key);
            }
            else {
                switch (ev.key){
                    case "Backspace":
                        this.numpad.state.deleteLastChar();
                        break;
                    case "Delete":
                        this.numpad.state.resetValue();
                        break;
                    case ",":
                        this.numpad.state.appendNewChar(".");
                        break;
                    case "+":
                        this.numpad.state.positiveSign();
                        break;
                    case "-":
                        this.numpad.state.negativeSign();
                        break;
                }
            }
        }
        this.buffered_key_events = [];
    },
});
gui.define_screen({name:'products', widget: ProductScreenWidget});
    
    return {
         ActionpadWidget: ActionpadWidget,
          NumpadWidget: NumpadWidget,
        ProductScreenWidget: ProductScreenWidget,
    };

});
