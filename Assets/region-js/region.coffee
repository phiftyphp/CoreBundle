###

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
###



# TODO: refactor the statusbar out, it should be a plugin or triggered by an event.


isIE = navigator.appName == 'Microsoft Internet Explorer'
if isIE
    jQuery.fx.off = true

Region =
  # global options
  opts:
    method: 'post'
    gateway: null
    statusbar: true
    effect: "fade"  # current only for closing.
  config: (opts) ->
    @opts = $.extend( @opts, opts)

class RegionHistory

class RegionNode
  constructor: (arg1,arg2,arg3,arg4) ->
    defaultOpts =
      historyBtn: false
      history: false
      # el,meta,path,args,opts

    isRegionNode = (e) -> typeof e is "object" and e instanceof RegionNode
    isElement = (e) -> typeof e is "object" and e.nodeType is 1
    isjQuery = (e) -> typeof e is "object" and e.get and e.attr

    if typeof arg1 is "object"
      # if specifeid, force it
      path = arg2 if arg2
      args = arg3 if arg3
      opts = arg4 if arg4
      opts = $.extend( defaultOpts , opts )

      if isjQuery(arg1)      # has jQuery.get method
        el = @initFromjQuery( arg1 )
      else if isElement( pathOrEl )
        el = @initFromElement( arg1 )
      else if isRegionNode( arg1 )
        return arg1

      meta = @readData( el )

      # save attributes
      @path = if meta.path then meta.path else path
      @args = if meta.args then meta.args else args
      @el   = el
      @opts = opts

      # sync attributes
      @save()
    else if typeof arg1 is "string"  # region path,
      path = arg1
      args = arg2 or { }

      if arg3
          opts = arg3
      opts = $.extend( defaultOpts , opts )

      # construct new node
      n = @createRegionDiv()

      @path = path
      @args = args
      @el   = n
      @opts = opts

      # sync attributes
      @save()
    else
      alert("Unknown Argument Type")
      return

  initFromjQuery: (el) ->
    if el.get(0) == null
      alert( 'Region Element not found.' )
      return
    return @init(el)

  asRegion: () -> this

  initFromElement: (e) ->
      el = $(e)
      return @init(el)

  init: (el) ->
    el.addClass( '__region' )
      .data('region',this)
    return el

  createRegionDiv: () -> this.initFromElement( $('<div/>') )

  # write path, args into DOM element attributes
  save: () ->
    @writeData( @path , @args )
    return this

  writeData: (path,args) ->
    @el.data('path',path)
    @el.data('args',args)

  # deparse meta from an element or from self._el
  readData: (el) ->
    path = el.data('path')
    args = el.data('args')
    return {
      path: path,
      args: args
    }

  history: (flag) -> return this._history

  hasHistory: () -> return this.history()._history.length > 0

  saveHistory: (path,args) ->
    if (( this.opts.history || Region.opts.history ) and this.path )
      this.history().push( this.path , this.args )

  back: (callback) ->
    a = @history().pop()
    @_request( a.path , a.args ) if a

  initHistoryObject: () ->
    if( @opts.history )
      @_history = new RegionHistory()

  createStatusbar: () ->
    return $('<div/>')
      .addClass('region-statusbar')
      .attr('id','region-statusbar')

  getStatusbarEl: () ->
    return RegionNode.statusbar if RegionNode.statusbar

    bar = $('#region-statusbar')
    return bar if bar.get(0)

    bar = @createStatusbar()
    $(document.body).append( bar )
    RegionNode.statusbar = bar
    return bar

  # waiting content
  setWaitingContent: () ->
    if( Region.opts.statusbar )
      bar = @getStatusbarEl()
      bar.addClass('loading')
        .html( "Loading content ..." )
        .show()
    waitingImg = $('<div/>').addClass('region-loading')
    @el.html( waitingImg )

  _request: (path, args, callback ) ->
    that = this
    @setWaitingContent()

    console.log("Request region, Path:" , path , "Args:" , args) if window.console

    onError = (e) ->
      if Region.opts.statusbar
        d = $('<div/>').addClass('region-message region-error')
        d.html( "Path: " + path + " " + ( e.statusText || e.responseText ) )
        that.getStatusbarEl().show().html( d )
      that.el.html( e.statusText )
      if( window.console )
        console.error( path , args ,  e.statusText || e.responseText )
      else
        alert( e.message )

    onSuccess = (html) ->
      if Region.opts.statusbar
        that.getStatusbarEl().addClass('animated bounceOutDown')
        setTimeout (->
          that.getStatusbarEl().hide().removeClass('animated bounceOutDown')
        ),2000


      if that.opts.noEffect
        that.el.hide().html(html).show 100, (-> callback(html) if callback)
        $(Region).trigger('region.load', [ that.el ])
      else
        # should we use animate.css? add some detection ?
        that.el.fadeOut 'fast', () ->
          # TODO: here the animation stuff should be a event handler or a callback.

          region = $(this)

          # hide the region container, then append the content, which improve the rendering performance.
          $(this).hide().html(html)
          $(Region).trigger('region.load', [that.el])
          return if that.opts.noEffect

          effectClass = region.data('effectClass')

          # if the effect class is defined, we should use the effect class name
          if effectClass
            # remove the animated class name, so that we can repeat the animation
            $(this).removeClass('animated flipInY')
            setTimeout (->
              that.el.addClass('animated flipInY').show 100, ->
                callback(html) if callback
            ), 10
          else
            $(this).fadeIn 'fast', () ->
              callback(html) if callback

          if that.opts.historyBtn or Region.opts.historyBtn
            if that.hasHistory()
              backbtn = $('<div/>').addClass('region-backbtn').click(-> that.back() )
              that.el.append( backbtn )

    if Region.opts.gateway
      $.ajax
        url: Region.opts.gateway
        type: Region.opts.method
        dataType: 'html'
        data: { path: path , args: args }
        error: onError
        cache: false
        success: onSuccess
    else
      $.ajax
        url: path
        data: args
        dataType: 'html'
        type: Region.opts.method
        cache: false
        error: onError
        success: onSuccess

  getEl: () -> @el

  refresh: (callback) -> @_request( @path , @args , callback )

  refreshWith: (args, callback) ->
    newArgs = $.extend( {} , @args, args)
    @args = newArgs
    @saveHistory()
    @_request( @path , newArgs , callback )
    @save()

  load: (path,args,callback) ->
    path ||= @path
    args ||= @args or {}
    @replace(path,args, callback )

  replace: (path,args,callback) ->
    @saveHistory()
    @path = path
    @args = args
    @save()
    @refresh( callback )

  # XXX: seems no use.
  of: () -> this.el

  parent: () -> return new RegionNode($( this.el.parents('.__region').get(0) ))

  subregions: () ->
    # /* find subregion elements and convert them into RegionNode */
    return this.regionElements().map( (e) ->
        return new RegionNode(e)
    )

  regionElements: () -> this.el.find('.__region')

  # setup region content == empty
  empty: () -> this.el.empty()

  # setup region content (html)
  html: (html) -> return this.el.html( html )

  # remove region
  remove: () -> this.el.remove()

  getEffectFunc: (hide) ->
    ef = Region.opts.effect
    return if isIE
    if ef is "fade"
      return if hide then jQuery.fn.fadeOut else jQuery.fn.fadeIn
    else if ef is "slide"
      return if hide then jQuery.fn.slideUp else jQuery.fn.slideDown
    else
      return

  effectRemove: () ->
    that = this
    m = this.getEffectFunc(1)
    if m
      m.call this.getEl() , 'fast' , () -> that.getEl().remove()
    else
      that.getEl().remove()

  fadeRemove: () ->
    that = this
    this.effectRemove()

  fadeEmpty: () ->
    that = this
    m = this.getEffectFunc(1)
    if m
      m.call this.getEl() , 'slow' , () -> that.getEl().empty().show()
    else
      this.getEl().empty().show()

  removeSubregions: () ->
      this.regionElements().map( (e) -> $(e).remove() )

  refreshSubregions: () ->
      this.regionElements().map( (e) ->
          r = new RegionNode(e)
          r.refresh()
      )

  submit: (formEl) ->
    ###
      // TODO:
      // Submit Action to current region.
      //    get current region path or from form 'action' attribute.
      //    get field values 
      //    send ajax post to the region path
      ###

  # find sub regions by id or ...
  find: () ->
    ## XXX:
    this.el.find

Region.get = (el) ->
  if typeof el is "array"
    return $(el).map (e,i) -> return Region.getOne(e)
  else
    return Region.getOne(el)

Region.getOne = (el) ->
  if el instanceof RegionNode
    return el
  else if( el.nodeType is 1 or el instanceof Element )
    return Region.of(el)
  else if( typeof el is "string" )
    return new RegionNode( $(el) )
  return new RegionNode(el)


###
 * Find the region from child element.
 *
 * @param el Child Element 
###
Region.of = (el) ->
  regEl = $(el).parents('.__region').get(0)
  return if not regEl
  return $(regEl).asRegion()

Region.append = (el,path,args) ->
  rn = new RegionNode(path,args)
  rn.refresh()
  $(el).append( rn.getEl() )
  return if rn.getEl() then true else false

###
* Insert a region after an element
*
###
Region.after = (el,path,args, triggerElement) ->
    rn = new RegionNode(path,args)
    rn.refresh()

    ## var p = $(el).parents('.__region')
    # rn.btn = $(el)
    if typeof el is 'RegionNode'
        rn.callerRegion = el
    else if triggerElement
        rn.triggerElement = triggerElement
    else
        rn.triggerElement = el
    rn.btn = el

    # insert new region after the region.
    $(el).after rn.getEl()
    return rn ? rn : false



###
 Insert a new region before the element.
###
Region.before = (el, path, args, triggerElement) ->
    # create new region node and load it with args
    rn = new RegionNode(path,args)

    if typeof el is 'RegionNode'
        rn.callerRegion = el
    else if triggerElement
        rn.triggerElement = triggerElement
    else
        rn.triggerElement = el
    rn.refresh()

    $(el).before( rn.getEl() )
    return rn ? rn : false

###
  Region.load( $('content'), 'path', { id: 123 } , function() {  } );
  Region.load( $('content'), 'path' , function() {  } );
  Region.load( $('content'), 'path' );

  Region.load doesn't sync path ,args to attirbute.
###

Region.load = (el,path,arg1,arg2) ->
  callback
  args = {  }
  if typeof arg1 is "object"
    args = arg1
    if typeof arg2 is "function"
      callback = arg2
  else if typeof arg1 is "function"
    callback = arg1

  rn = new RegionNode(el)
  rn.replace( path, args )
  return rn

Region.replace = (el,path,arg1,arg2) ->
    rn = this.load(el,path,arg1,arg2)
    rn.save()
    return rn


jQuery.fn.asRegion = (opts) ->
  r = $(this).data('region')
  return r if r

  r = new RegionNode( $(this), null, opts)
  $(this).data('region',r)
  return r


window.RegionHistory = RegionHistory
window.RegionNode = RegionNode
window.Region = Region
jQuery.region = Region
