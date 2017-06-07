// Generated by CoffeeScript 1.9.3

/*

vim:sw=2:ts=2:sts=2:et:

    jQuery Region
    Copyright (C) 2010 Yo-An Lin <cornelius.howl@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
  var Region, RegionHistory, RegionNode, isIE;

  isIE = navigator.appName === 'Microsoft Internet Explorer';

  if (isIE) {
    jQuery.fx.off = true;
  }

  Region = {
    opts: {
      method: 'post',
      gateway: null,
      statusbar: true,
      effect: "fade"
    },
    config: function(opts) {
      return this.opts = $.extend(this.opts, opts);
    }
  };

  RegionHistory = (function() {
    function RegionHistory() {}

    return RegionHistory;

  })();

  RegionNode = (function() {
    function RegionNode(arg1, arg2, arg3, arg4) {
      var args, defaultOpts, el, isElement, isRegionNode, isjQuery, meta, n, opts, path;
      defaultOpts = {
        historyBtn: false,
        history: false
      };
      isRegionNode = function(e) {
        return typeof e === "object" && e instanceof RegionNode;
      };
      isElement = function(e) {
        return typeof e === "object" && e.nodeType === 1;
      };
      isjQuery = function(e) {
        return typeof e === "object" && e.get && e.attr;
      };
      if (typeof arg1 === "object") {
        if (arg2) {
          path = arg2;
        }
        if (arg3) {
          args = arg3;
        }
        if (arg4) {
          opts = arg4;
        }
        opts = $.extend(defaultOpts, opts);
        if (isjQuery(arg1)) {
          el = this.initFromjQuery(arg1);
        } else if (isElement(pathOrEl)) {
          el = this.initFromElement(arg1);
        } else if (isRegionNode(arg1)) {
          return arg1;
        }
        meta = this.readData(el);
        this.path = meta.path ? meta.path : path;
        this.args = meta.args ? meta.args : args;
        this.el = el;
        this.opts = opts;
        this.save();
      } else if (typeof arg1 === "string") {
        path = arg1;
        args = arg2 || {};
        if (arg3) {
          opts = arg3;
        }
        opts = $.extend(defaultOpts, opts);
        n = this.createRegionDiv();
        this.path = path;
        this.args = args;
        this.el = n;
        this.opts = opts;
        this.save();
      } else {
        alert("Unknown Argument Type");
        return;
      }
    }

    RegionNode.prototype.initFromjQuery = function(el) {
      if (el.get(0) === null) {
        alert('Region Element not found.');
        return;
      }
      return this.init(el);
    };

    RegionNode.prototype.asRegion = function() {
      return this;
    };

    RegionNode.prototype.initFromElement = function(e) {
      var el;
      el = $(e);
      return this.init(el);
    };

    RegionNode.prototype.init = function(el) {
      el.addClass('__region').data('region', this);
      return el;
    };

    RegionNode.prototype.createRegionDiv = function() {
      return this.initFromElement($('<div/>'));
    };

    RegionNode.prototype.save = function() {
      this.writeData(this.path, this.args);
      return this;
    };

    RegionNode.prototype.writeData = function(path, args) {
      this.el.data('path', path);
      return this.el.data('args', args);
    };

    RegionNode.prototype.readData = function(el) {
      var args, path;
      path = el.data('path');
      args = el.data('args');
      return {
        path: path,
        args: args
      };
    };

    RegionNode.prototype.history = function(flag) {
      return this._history;
    };

    RegionNode.prototype.hasHistory = function() {
      return this.history()._history.length > 0;
    };

    RegionNode.prototype.saveHistory = function(path, args) {
      if ((this.opts.history || Region.opts.history) && this.path) {
        return this.history().push(this.path, this.args);
      }
    };

    RegionNode.prototype.back = function(callback) {
      var a;
      a = this.history().pop();
      if (a) {
        return this._request(a.path, a.args);
      }
    };

    RegionNode.prototype.initHistoryObject = function() {
      if (this.opts.history) {
        return this._history = new RegionHistory();
      }
    };

    RegionNode.prototype.createStatusbar = function() {
      return $('<div/>').addClass('region-statusbar').attr('id', 'region-statusbar');
    };

    RegionNode.prototype.getStatusbarEl = function() {
      var bar;
      if (RegionNode.statusbar) {
        return RegionNode.statusbar;
      }
      bar = $('#region-statusbar');
      if (bar.get(0)) {
        return bar;
      }
      bar = this.createStatusbar();
      $(document.body).append(bar);
      RegionNode.statusbar = bar;
      return bar;
    };

    RegionNode.prototype._request = function(path, args, callback) {
      var $el, offset, onError, onSuccess, that;
      that = this;
      $(Region).trigger('region.waiting', [this]);
      $el = this.getEl();
      $(Region).trigger('region.unmount', [$el]);
      if (window.console) {
        console.log("Request region, Path:", path, "Args:", args);
      }
      $el.addClass('region-loading');
      offset = $el.offset();
      onError = function(e) {
        $el.removeClass('region-loading');
        if (window.console) {
          return console.error(path, args, e.statusText || e.responseText);
        } else {
          return alert(e.message);
        }
      };
      onSuccess = function(data, textStatus, jqXHR) {
        var html;
        if (jqXHR.responseJSON) {
          if (data.login_required) {
            if (data.login_modal_url && typeof ModalManager !== "undefined") {
              CRUDModal.open({
                "title": "登入",
                "url": data.login_modal_url,
                "controls": [
                  {
                    label: '登入',
                    primary: true,
                    onClick: function(e, ui) {
                      return ui.body.find("form").submit();
                    }
                  }
                ]
              });
              return;
            }
            if (data.redirect) {
              window.location = data.redirect;
            }
          }
          return;
        }
        html = data;
        $(Region).trigger('region.finish', [this]);
        $el.removeClass('region-loading');
        that.el.html(html);
        if (callback) {
          callback(html);
        }
        return $(Region).trigger('region.load', [that.el]);
      };
      if (Region.opts.gateway) {
        return $.ajax({
          url: Region.opts.gateway,
          type: Region.opts.method,
          data: {
            path: path,
            args: args
          },
          error: onError,
          cache: false,
          success: onSuccess,
          accepts: {
            xml: 'text/xml',
            html: 'text/html',
            json: 'application/json'
          }
        });
      } else {
        return $.ajax({
          url: path,
          data: args,
          type: Region.opts.method,
          cache: false,
          error: onError,
          accepts: {
            xml: 'text/xml',
            html: 'text/html',
            json: 'application/json'
          },
          success: onSuccess
        });
      }
    };

    RegionNode.prototype.getEl = function() {
      return this.el;
    };

    RegionNode.prototype.refresh = function(callback) {
      return this._request(this.path, this.args, callback);
    };

    RegionNode.prototype.refreshWith = function(args, callback) {
      var newArgs;
      newArgs = $.extend({}, this.args, args);
      this.args = newArgs;
      this.saveHistory();
      this._request(this.path, newArgs, callback);
      return this.save();
    };


    /*
    refreshWithout will clear the last query arguments base on the given
    arguments
     */

    RegionNode.prototype.refreshWithout = function(args, callback) {
      var k, v;
      for (k in args) {
        v = args[k];
        delete this.args[k];
      }
      console.log(args, this.args);
      this.saveHistory();
      this._request(this.path, this.args, callback);
      return this.save();
    };

    RegionNode.prototype.load = function(path, args, callback) {
      path || (path = this.path);
      args || (args = this.args || {});
      return this.replace(path, args, callback);
    };

    RegionNode.prototype.replace = function(path, args, callback) {
      this.saveHistory();
      this.path = path;
      this.args = args;
      this.save();
      return this.refresh(callback);
    };

    RegionNode.prototype.of = function() {
      return this.el;
    };

    RegionNode.prototype.parent = function() {
      return new RegionNode($(this.el.parents('.__region').get(0)));
    };

    RegionNode.prototype.subregions = function() {
      return this.regionElements().map(function(e) {
        return new RegionNode(e);
      });
    };

    RegionNode.prototype.regionElements = function() {
      return this.el.find('.__region');
    };

    RegionNode.prototype.empty = function() {
      return this.el.empty();
    };

    RegionNode.prototype.html = function(html) {
      return this.el.html(html);
    };

    RegionNode.prototype.remove = function() {
      return this.el.remove();
    };

    RegionNode.prototype.getEffectFunc = function(hide) {
      var ef;
      ef = Region.opts.effect;
      if (isIE) {
        return;
      }
      if (ef === "fade") {
        if (hide) {
          return jQuery.fn.fadeOut;
        } else {
          return jQuery.fn.fadeIn;
        }
      } else if (ef === "slide") {
        if (hide) {
          return jQuery.fn.slideUp;
        } else {
          return jQuery.fn.slideDown;
        }
      } else {

      }
    };

    RegionNode.prototype.effectRemove = function() {
      var m, that;
      that = this;
      m = this.getEffectFunc(1);
      if (m) {
        return m.call(this.getEl(), 'fast', function() {
          return that.getEl().remove();
        });
      } else {
        return that.getEl().remove();
      }
    };

    RegionNode.prototype.fadeRemove = function() {
      var that;
      that = this;
      return this.effectRemove();
    };

    RegionNode.prototype.fadeEmpty = function() {
      var m, that;
      that = this;
      m = this.getEffectFunc(1);
      if (m) {
        return m.call(this.getEl(), 'slow', function() {
          return that.getEl().empty().show();
        });
      } else {
        return this.getEl().empty().show();
      }
    };

    RegionNode.prototype.removeSubregions = function() {
      return this.regionElements().map(function(e) {
        return $(e).remove();
      });
    };

    RegionNode.prototype.refreshSubregions = function() {
      return this.regionElements().map(function(e) {
        var r;
        r = new RegionNode(e);
        return r.refresh();
      });
    };

    RegionNode.prototype.submit = function(formEl) {

      /*
        // TODO:
        // Submit Action to current region.
        //    get current region path or from form 'action' attribute.
        //    get field values 
        //    send ajax post to the region path
       */
    };

    RegionNode.prototype.find = function() {
      return this.el.find;
    };

    return RegionNode;

  })();

  Region.get = function(el) {
    if (typeof el === "array") {
      return $(el).map(function(e, i) {
        return Region.getOne(e);
      });
    } else {
      return Region.getOne(el);
    }
  };

  Region.getOne = function(el) {
    if (el instanceof RegionNode) {
      return el;
    } else if (el.nodeType === 1 || el instanceof Element) {
      return Region.of(el);
    } else if (typeof el === "string") {
      return new RegionNode($(el));
    }
    return new RegionNode(el);
  };


  /*
   * Find the region from child element.
   *
   * @param el Child Element
   */

  Region.of = function(el) {
    var regEl;
    regEl = $(el).parents('.__region').get(0);
    if (!regEl) {
      return;
    }
    return $(regEl).asRegion();
  };

  Region.append = function(el, path, args) {
    var rn;
    rn = new RegionNode(path, args);
    rn.refresh();
    $(el).append(rn.getEl());
    if (rn.getEl()) {
      return true;
    } else {
      return false;
    }
  };


  /*
  * Insert a region after an element
  *
   */

  Region.after = function(el, path, args, triggerElement) {
    var rn;
    rn = new RegionNode(path, args);
    rn.refresh();
    if (typeof el === 'RegionNode') {
      rn.callerRegion = el;
    } else if (triggerElement) {
      rn.triggerElement = triggerElement;
    } else {
      rn.triggerElement = el;
    }
    rn.btn = el;
    $(el).after(rn.getEl());
    return rn != null ? rn : {
      rn: false
    };
  };


  /*
   Insert a new region before the element.
   */

  Region.before = function(el, path, args, triggerElement) {
    var rn;
    rn = new RegionNode(path, args);
    if (typeof el === 'RegionNode') {
      rn.callerRegion = el;
    } else if (triggerElement) {
      rn.triggerElement = triggerElement;
    } else {
      rn.triggerElement = el;
    }
    rn.refresh();
    $(el).before(rn.getEl());
    return rn != null ? rn : {
      rn: false
    };
  };


  /*
    Region.load( $('content'), 'path', { id: 123 } , function() {  } );
    Region.load( $('content'), 'path' , function() {  } );
    Region.load( $('content'), 'path' );
  
    Region.load doesn't sync path ,args to attirbute.
   */

  Region.load = function(el, path, arg1, arg2) {
    callback;
    var args, callback, rn;
    args = {};
    if (typeof arg1 === "object") {
      args = arg1;
      if (typeof arg2 === "function") {
        callback = arg2;
      }
    } else if (typeof arg1 === "function") {
      callback = arg1;
    }
    rn = new RegionNode(el);
    rn.replace(path, args);
    return rn;
  };

  Region.replace = function(el, path, arg1, arg2) {
    var rn;
    rn = this.load(el, path, arg1, arg2);
    rn.save();
    return rn;
  };

  jQuery.fn.asRegion = function(opts) {
    var r;
    r = $(this).data('region');
    if (r) {
      return r;
    }
    r = new RegionNode($(this), null, opts);
    $(this).data('region', r);
    return r;
  };

  window.RegionHistory = RegionHistory;

  window.RegionNode = RegionNode;

  window.Region = Region;

  jQuery.region = Region;

}).call(this);
