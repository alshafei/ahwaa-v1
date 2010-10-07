Class('Remote')({
    remote: {
        create: '/create.json',
        update: '/update.json',
        destroy: '/destroy.json'
    },
    url_for: function(url, attrs) {
        attrs = attrs || {};
        return url.replace(/:\w+/g, function(match) {
            var m = match.substring(1);
            if(attrs[m] !== undefined) {
                return attrs[m];
            } else {
                return match;
            }
        });
    },
    prototype: {
        init: function(attrs) {
            this.attributes = {id: null};
            $.extend(this.attributes, attrs || {});
            $.extend(this, this.attributes);
        },
        new_record: function() {
            return this.id === null;
        },
        save: function() {
            var url = this.new_record() ? this.constructor.remote.create : this.constructor.remote.update;
            var data = {}, attrs = {};
            for(var attr in this.attributes) {
                if(this.attributes.hasOwnProperty(attr) && this.attributes[attr] !== null) {
                    attrs[attr] = this.attributes[attr];
                }
            }
            data[this.constructor.className.toLowerCase()] = attrs;
            $.ajax({
                url: this.constructor.url_for(url, this.attributes),
                type: this.new_record() ? 'post' : 'put',
                data: data,
                dataType: 'json',
                context: this,
                success: function(response) {
                    $.extend(this.attributes, response[this.constructor.className.toLowerCase()]);
                    $.extend(this, this.attributes);
                    this.valid = true;
                },
                error: function(response) {
                    this.errors = eval('(' + response.responseText + ')');
                    this.valid = false;
                },
                async: false
            });
            return this.valid;
        },
        update_attributes: function(attrs) {
            $.extend(this.attributes, attrs || {});
            return this.save();
        }
    }
});
