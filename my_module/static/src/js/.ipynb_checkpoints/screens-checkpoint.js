odoo.define('custom-button.custom_button', function (require) {
"use strict";
var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');


screens.NumpadWidget.inclue({
    
        applyAccessRights: function() {
       console.log("test including",);
        }
       
    },
    
});
    
console.log("hi i'm ",screens);





});