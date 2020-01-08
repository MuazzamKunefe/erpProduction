odoo.define('pos_timeout.models', function (require) {
    'use strict';
    
      var models = require('point_of_sale.models');

    /*************************************************************************
        Extend module.PosModel:
            Overload _save_to_server to alter the timeout
     */
    var PosModelParent = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        _save_to_server: function (orders, options) {
                  console.log("new Timer2");
            // Get PoS Config Settings
            var timeout = 0.000002;
            if (timeout > 0) {
                arguments[1].timeout = timeout * 1000;
            }
            return PosModelParent._save_to_server.apply(this, arguments);
        },
        
        
    after_load_server_data: function() {
        var res = PosModelParent.after_load_server_data.call(this);
        if (this.config.iface_floorplan) {
	    var self = this;
            this.table = null;
	    $('.screen').not('.floor-screen').onmousemove = 	function() {self.set_idle_timer(true,5)};
	    $('.screen').not('.floor-screen').onmousedown = 	function() {self.set_idle_timer(true,5)}; // touchscreen presses
	    $('.screen').not('.floor-screen').ontouchstart = function() {self.set_idle_timer(true,5)};
	    $('.screen').not('.floor-screen').onclick = 	function() {self.set_idle_timer(true,5)};     // touchpad clicks
	    $('.screen').not('.floor-screen').onscroll = 	function() {self.set_idle_timer(true,5)};    // scrolling with arrow keys
	    $('.screen').not('.floor-screen').onkeypress = 	function() {self.set_idle_timer(true,5)};
        }
         console.log("new Timer3");
        return res;
    },
        
        
    });

});
    
    
    