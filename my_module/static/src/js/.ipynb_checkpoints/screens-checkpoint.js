odoo.define('pos_clear_orderline.pos', function (require) {
"use strict";

var screens = require('point_of_sale.screens');

    var OrderLineClear = screens.ActionButtonWidget.extend({
        template: 'OrderLineClear',
        button_click: function(){
         var order = self.pos.get_order();
             var lines = jQuery.extend(true, {}, order['orderlines']['models']);

     //looping through each line
             $.each(lines, function(k, line){
             console.log(line);
             line.set_quantity('remove');
        });

        },
    });
    screens.define_action_button({
        'name': 'OrderLine_Clear',
        'widget': OrderLineClear,
    });



});
