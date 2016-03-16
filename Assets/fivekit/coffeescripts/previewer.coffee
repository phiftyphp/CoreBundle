###
Dependencies: FiveKit.Dropbox,
              FiveKit.FileReader,
              jQuery.exif.js
###

$ = jQuery
window.FiveKit = {} unless window.FiveKit

class window.FiveKit.Previewer

  # XXX: we may use dom hash to save these dom element objects
  # dom: {}

  constructor : (@options) ->
    @fileInput = $(@options.el)
    @fieldName = @fileInput.attr('name')

    # create a hidden input for saving the uploaded path
    @hiddenInput = @createHiddenInput(@fieldName)

    # find the parent widget container element
    @widgetContainer = @fileInput.parents(".formkit-widget-thumbimagefile")

    @widgetContainer.css({
      position: "relative"
    })

    # find the existing image cover
    @cover = @widgetContainer.find(".formkit-image-cover")

    # find cover image (note that cover wrapper can be empty)
    @coverImage = @cover.find('img')
    @coverImage.css({ zIndex: 1 })

    # @cover.wrap('<a class="cover-preview-image" target="_blank" href="' + @coverImage.attr('src') + '"></a>')

    @autoresizeCheckbox = @widgetContainer.find('.autoresize-checkbox')
    @autoresizeTypeSelector = @widgetContainer.find('.autoresize-type-selector')

    @initialize()

  initialize : () ->
    # .formkit-widget-thumbimagefile (original)
    @fileInput.on "change", (e) =>
      @use "file"
      @renderPreviewImage(e.target.files[0]) if e.target.files?[0]
      # if the user select file from local, then make 'hidden' Value the same with FileInput
      # to make sure data key-value table would get the same value
      #
      # We have C:\fakepath problem here
      # Some browsers is preventing users to get file input value from js.
      # @hiddenInput.val(    )
    @fileInput.after( @hiddenInput )


    # resize preview cover
    d = @getImageDimension()

    # create a dropzone element
    $dropzone = $('<div/>').addClass('image-dropzone').css({
      position: 'absolute'
      zIndex: 2
    })
    @cover.before $dropzone

    defaultDimension = { width: 240, height: 120 }

    @widgetContainer.css({ display: 'inline-block' })

    # create image holder
    @updateCover(d)

    if d and d.width and d.height
      @cover.css( @scalePreviewDimension(d) )
      $dropzone.css( @scalePreviewDimension( d ) )
    else
      @cover.css(defaultDimension)
      $dropzone.css(defaultDimension)



    # Finally, setup the dropbox uploader
    @initDropbox $dropzone

  updateCover: (d) ->
    if not @coverImage.get(0)
      @insertImageHolder(d)
    else
      @scaleCoverImageByDefault(d) if d

      # image cover html generated from backend does not contains
      # remove button and exif button.
      @initCoverController()

  scalePreviewDimension: (d) ->
    if d.width > 350
      r = 350 / d.width
      d.width  *= r
      d.height *= r
    if d.height > 300
      r = 300 / d.height
      d.width  *= r
      d.height  *= r
    return d

  insertImageHolder: (d) ->
    # return unless d and d?.width and d?.height
    return if window.navigator.userAgent.match(/MSIE 8/)
    # holdertheme = "social"
    holdertheme = "auto"

    if d and d.width and d.height
      $imageholder = $('<img/>').attr("data-src", ["holder.js", d.width + "x" + d.height, holdertheme].join("/"))

      # resize the image if the size is too large.
      d = @scalePreviewDimension(d)
      $imageholder.css(d)
    else if d and (d.width or d.height)
      text = if d and d.width then d.width else "Any"
      text += " x "
      text += if d and d.height then d.height else "Any"
      $imageholder = $('<img/>').attr("data-src", ["holder.js", "240x120", "text:" + text, holdertheme].join("/"))
      $imageholder.css({ width: 240, height: 120 })
    else
      $imageholder = $('<img/>').attr("data-src", ["holder.js", "240x120", "text:Any Size", holdertheme].join("/"))
      $imageholder.css({ width: 240, height: 120 })

    @cover.append $imageholder
    if typeof Holder isnt "undefined"
      Holder.run images: $imageholder.get(0)
    else
      console.warn("Holder js is not installed.")

  getImageDimension: () ->
    d = { }
    d.width = @fileInput.data('width') if @fileInput.data('width')
    d.height = @fileInput.data('height') if @fileInput.data('height')
    return d

  removeCoverImage: () -> @cover.empty()

  createHiddenInput: (name) ->
    # .formkit-widget-thumbimagefile-hidden
    # create a hiddenFileInput for later use
    # why we have to reassign name attribute is because the form would use a key-value mapping 
    # to store fileds' information
    $input = $('<input type="hidden" class="formkit-widget-thumbimagefile-hidden">')
    return $input

  initDropbox: (dropzone) ->
    # set + create DOM
    progressBarContainer = $('<div/>').addClass("upload-progress clearfix")
      .css({ marginTop: 5 })
    progressBarContainer.hide()

    @widgetContainer.after(progressBarContainer)

    uploader = new FiveKit.DropBoxUploader
      el: dropzone
      queueEl: progressBarContainer

      # hide the queue first
      onDrop: (e) =>
        progressBarContainer.empty().show()
        @renderPreviewImage(e.dataTransfer.files[0]) if ( e.dataTransfer.files?[0] )

      # change with the img src from server
      onTransferComplete: (e, result, progressItem) =>
        @use('hidden')

        if result.success? and result.data?.file
          @renderUploadImage(result.data?.file)
          # fadeOut progress container after 1.2 second only when upload success
          setTimeout (-> progressBarContainer.fadeOut()), 2000
        else if result.error
          @removeCoverImage()
          @insertImageHolder(@getImageDimension())
          progressItem.setError(result?.message || "Upload Error")


  # runAction use 'name' attribute to recognize the which feild is going to be sent to server,
  # so we have to make 'name' attribute unique in previewer
  use: (type) ->
    if type is 'hidden'
      @hiddenInput.attr('name', @fieldName)
      @fileInput.attr('name', '')
      @fileInput.hide()
    else if type is 'file'
      @fileInput.attr('name', @fieldName)
      @fileInput.show()
      @hiddenInput.attr('name', '')

  scaleCoverImageByMaxWidth: (d) ->
    @coverImage.css { width: '100%', height: 'auto' } if @coverImage.width() > d.width

  scaleCoverImageByMaxHeight: (d) ->
    @coverImage.css { height: '100%', width: 'auto' } if @coverImage.height() > d.height

  scaleCoverImageByFullScale: (d) ->
    $(img).css { height: '100%', width: '100%' }

  scaleCoverImageByDefault: (d) ->
    if d and @coverImage.get(0)
      d = @scalePreviewDimension(d)
      @coverImage.css(d)
      # if @coverImage.height() > d.height
      #   @coverImage.css { height: '100%', width: 'auto' }
      # if @coverImage.width() > d.width
      #   @coverImage.css { width: '100%', height: 'auto' }

  # src: image src path or base64 encoded content
  renderCoverImage: (src) ->
    # first cleanup existing cover image
    @removeCoverImage()
    self = this

    d = @getImageDimension()
    @coverImage = $('<img/>').appendTo @cover
    @coverImage.hide()

    # for IE7 or upper, we should setup the load handler before we set the image source.
    @coverImage.on 'load', ->
      $(this).exifLoad()
      self.scaleCoverImageByDefault(d) if d
      $(this).fadeIn()
    @coverImage.attr('src', src)
    @initCoverController()
    return @coverImage

  initCoverController: () ->
    # TODO: Extract to css for this remove button
    removeButton = $(document.createElement('div')).addClass('remove')
      .css({
        'zIndex': 1000
        'position': 'absolute'
        'top': 3
        'right': 7
        'color': '#ffffff'
      })
    removeButton.append( $('<div/>').addClass('fa fa-times-circle') )

    removeButton.on 'click', (e) =>
      e.stopPropagation()

      @removeCoverImage()
      @use "file"
      @insertImageHolder( @getImageDimension() )
      return false
    @cover.append removeButton

    if @fileInput.data('exif')
      exifButton = $('<div/>').addClass('exif').css('zIndex', 1000).appendTo @cover
      exifButton.on 'click', (e) ->
      exifData = $(this).exifPretty()
      if $.isEmptyObject( exifData ) or not exifData
          exifData = "No EXIF information"
      alert exifData

  renderUploadImage: (src) ->
    # the uploaded image path is relative, such as "upload/product1.png"
    # so we should prepend a prefix
    @renderCoverImage "/" + src
    @hiddenInput.val src

  # use file api to render preview image before the file is uploaded.
  # @file: local file path from drop elements
  renderPreviewImage : (file) ->
    # we can renderPreviewImage from input.onChange or dropzone.onDrop
    filereader = new FiveKit.FileReader
      onLoaded : (e) =>
        ###
        image = new Image
        image.onload = (imageEvent) ->
          canvas = document.createElement('canvas')
          max_size = 544
          width = image.width
          height = image.height
          canvas.width = width
          canvas.height = height
        image.src = e.target.result
        ###
        @renderCoverImage(e.target.result) # base64 encoded file content
        # take off original thumbimagefile input for uploading
        @fileInput.hide()
    filereader.read( file )

# combine with formkit
FormKit.register (e, scopeEl) ->
  $(scopeEl)
    .find('.formkit-widget-thumbimagefile input[data-droppreview=true]')
    .each (i, fileInput) ->
      console.info("init previewer at ", fileInput)
      previewer = new FiveKit.Previewer {el : $(fileInput)}
