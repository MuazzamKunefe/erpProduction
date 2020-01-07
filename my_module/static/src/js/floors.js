odoo.define('custom-time.custom_time', function (require) {    

set_idle_timer.include(
    
    {
        timeout = timeout || 2000;
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
            )
    
});