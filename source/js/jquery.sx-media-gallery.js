;(function ($, window, document, undefined) {
    'use strict';

    // Create the defaults once
    var pluginName = 'sxMediaGallery';
    var pluginPrefix = 'sxmg';

    const FileType = {
        File: 'file',
        Image: 'image',
        Video: 'video',
        Audio: 'audio',
        PDF: 'pdf',
        Excel: 'excel',
        Word: 'word',
        PowerPoint: 'powerpoint',
        Text: 'text',
        ZIP: 'zip'
    };

    const IconCollection = {
        Close: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABYElEQVRYR7WX7RHCIAyG46Y6gTqJOoGu6AR6L3fhUkrIB5Rfnm3zPAUS0hPtx5mI3kT0JKJ753rmrwcRIS7ifWSAUxON4fw3br5kiOIZvAzi8kC8KiEFWvgKiRa+k2ABDT4jocE3EhCw4BkJC14lIPALrLFnT3jhBRuZAc9MhODY4N490E5SbybCcGSDJwu0FZISKTgvgQR4N6RcDvyWeW5tKbUO8INRCQsor2/gvRk4UmIHHwnwtGJtV4wu3BJYJaHCPQKzEkO4VyArgaMXR/pwtMexdnM0zxHHU7ZLKbZGBi7rxLCfsARm4C6JkcAKuCmhCayEDyV6AkfAVYlWIArnDRapmJvskAIZOHe30QOsSrDADDx7gBUJCKBaXa1iIK6Pymt0Jl7RptSs7YEuG+/0jTSlHnh0OdxNaQTulSgxPU1pBm5J1JjWx+kMXJNwNaXIjFv7KR3IlPZWZEc35h/4CGLAjclibQAAAABJRU5ErkJggg==',
        Menu: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARUlEQVRYR+3U0QkAIAgFQN1/6IL6aQIVOhd4cujLaJ5szg8LEHgFVvFBnmwLEBglUPwEN25UEekBAgT0gBsgQEAP/CmwAdmEEiEL49BKAAAAAElFTkSuQmCC',
        Download: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABqklEQVRYR+2X7U3DMBCG327ACDABMAEwATABMAGMABNAJ4BOQDcAJqBswAbQCUBPdFeFJK4/4qp/OKlKFdn3Pr4725eJtmyTLevrH6BWBC4knUk6lrQj6VvSq6SpPYOZTgXA+amkXUmfku7seSDpURLPkAFyblC9MSkACFx2ZrLCW/ux4pgtJJ0MQcQAEAaghs0tEn98xQAI31ENdfNxKIlorCwG8GVFVYuBorwJAZDLa8s3xbYJe7Od0osAVfxsVb4JYfdJ8T7Y9uR/cxKy8pfIVqoNhTi7YgEAObmvrZDgD4g9AN4LV98t4J8E0e6QKU5KJnr62g5L/DQpKJlYC6ApQg6G/YLw1UjBEielx20NgJk7KYnCWIAlxe9OOAs499el4knSVWKqYlFFnDHz7ip4ybkQAkmBWCeOMLciVzl9RXJPiDBdD7YOoi0+G+gjegGM3YbtCTGIbPGcCDhICKJIvATAU9BOB1esd01JYQ/1A4kFvqoDh/B52eKlEWBed9t+WKPR3PE5llOEXb8OwXu+B7LFx0TAYbwlLxKvAZAT7cGxY1IwWhwHv/0QUz8k+/1lAAAAAElFTkSuQmCC',
        Profile: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABIklEQVRYR+2XYQ3CMBSEbwrAAeAAJyABB+AAcAAOkIAUJIADHEBudMvWjLzjNR1Zsv4hjJf3vh3XS1vgs04AVgDm4XuujzuAC4BjNaAIw7e5Jn7pS4ADfyPAE8CkZwAqsagAXj0Pb6pfKhAD8FmO1TlnUABTAHsA6yBPy82CZMkKcKvGu+UMYCcMZ0kyQNduqd0sQGQBePwQXskADA56oLnqQOlDgSqymyYs00xcbgWWkfvjedeQ7TcDxA1Ao82M5ooZ3QBqVFsJOlwA0WNmmVsBs7NY4AZQPRBzxJ4YLoCosFnmVsDsLBa4AUYPiAqbZe6/wOwsFowAsgKiosllZVL+62pWnyUJ0HXWS349o0HrcspaQmyEk08qGN+cF5r6LPkGr15XIUxe5/QAAAAASUVORK5CYII=',
        ArrowLeft: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAu0lEQVRYR82XYQ6AIAhG8abdrI7abHMzBoIyP+x38B4sCQslPyXIv4joieSICFT4TUSRHMvBDV6Lhwv0cLgAh0MFJDhMQINDBEbw7QIWfKuABx6ZQV+sdoYhcE0ABpcEoHAuAIf3AinwowSqTEoX+DGES0hzACpx5CBq4xXSCWud8khYOYb/C0+wJeHJoUp4g1MXEuub8BYhdmE2OHUp1ToxW8SvE6vBqRcT3onVIoYrmXfXS72ceiWH772wrR4VW0r/CgAAAABJRU5ErkJggg==',
        ArrowRight: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAq0lEQVRYR8XXAQqAIAyF4XnTulmdtFiQIGZuc2/zAP4fgg4LJa/i0D+IaLPu4wG4iIgRuwXhBeC2CeEJMCG8AWoEAqBCoABiBBIgQqABUwQD+B6j1/CKRgGGJxEJ+EREAzpEBqBBZAEqIhNw8hjPAjxxPoYMQI1nAJp4NKCLRwI+4y9gdQ7MZskwHgH4jaMB0zgSIIqjAOI4AqCKewPUcU+AKe4FSP+cLj1kN48NOiE+oolLAAAAAElFTkSuQmCC'
    };

    var extendDefaults = function (source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    class SXMediaMaterial {
        constructor(obj) {
            this.id = '';
            this.url = '';
            this.thumbnail = '';
            this.type = '';
            this.title = '';
            this.comment = '';
            this.date = null;

            if (obj && typeof obj == 'object')
                extendDefaults(this, obj);

            if (this.date)
                this.date = new Date(this.date);

            if (this.type == null || this.type == undefined || this.type == '')
                this.type = SXMediaMaterial.defineFileType(this.url);

            if (this.type == FileType.Image && (!this.thumbnail || this.thumbnail == ''))
                this.thumbnail = this.url;
        }

        get hasInfoToDisplay() {
            return this.dateString || this.title || this.comment;
        }

        get dateString() {
            if (this.date == null || this.date == undefined || !(this.date instanceof Date))
                return '';

            let year = this.date.getFullYear();
            let month = this.date.getMonth() + 1;
            if (month < 10)
                month = "0" + month.toString();
            let day = this.date.getDate();

            return `${day}.${month}.${year}`;
        }

        toString() {
            return this.url;
        }

        static defineFileType(filename) {
            if (!filename || typeof filename != 'string' || filename == '')
                return FileType.File;

            let extenstion = filename.substring(filename.lastIndexOf('.') + 1);
            switch (extenstion) {
                case "jpeg":
                case "jpg":
                case "bmp":
                case "png":
                case "gif":
                case "tiff":
                    return FileType.Image;

                case "avi":
                case "mpeg":
                case "mp4":
                case "wmv":
                case "mov":
                    return FileType.Video;

                case "mp3":
                case "wav":
                case "wma":
                    return FileType.Audio;

                case "pdf":
                    return FileType.PDF;

                case "doc":
                case "docx":
                case "dotx":
                    return FileType.Word;

                case "xls":
                case "xlsx":
                    return FileType.Excel;

                case "ppt":
                case "pptx":
                    return FileType.PowerPoint;

                case "txt":
                    return FileType.Text;

                case "zip":
                case "7z":
                case "rar":
                    return FileType.ZIP;

                default:
                    return FileType.File;
            }
        }
    }

    class SXMediaGalleryViewer {
        constructor(options) {
            this._defaults = {width: 1, height: 1, infoVisible: true};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-viewer";

            this._element = $(`<div class='${this._prefix} unselectable'></div>`);

            this._info = new SXMediaGalleryViewerInfo({visible: this._options.infoVisible});
            this.element.append(this.info.element);
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get info() {
            return this._info == undefined ? null : this._info;
        }

        get content() {
            return this._content == undefined ? null : this._content;
        }

        // get current material
        get material() {
            return this._material == undefined ? null : this._material;
        }

        // set current material
        set material(obj) {
            this.clear();

            if (obj == null || obj == undefined)
                this._material = null;
            else if (obj instanceof SXMediaMaterial)
                this._material = obj;
            else if (typeof obj == 'object')
                this._material = new SXMediaMaterial(obj);
            else
                throw new Error("Invalid Material object specified!");
        }

        // display GalleryViewer content
        displayMaterial(material) {
            let prefix = this._prefix;

            if (this.element == null)
                throw new Error('GalleryView DOM element is destroyed!');

            if (material != undefined)
                this.material = material;

            this.clear();

            if (this.material == null)
                return;


            //define different material types content
            if (this.material.type.toLowerCase() == FileType.Image.toLowerCase()) {
                this._content = $(`<img src=${this.material.url} class='${prefix}-content ${prefix}-content-image'>`);
                this._content.css('visibility', 'hidden');

                this._content.load(function (event) {
                    this._contentOriginalWidth = event.target.width;
                    this._contentOriginalHeight = event.target.height;
                    this.resize();
                    this._content.css('visibility', 'visible');
                }.bind(this));
            }
            else {
                this._contentOriginalWidth = 640;
                this._contentOriginalHeight = 480;

                if (this.material.type.toLowerCase() == FileType.Video.toLowerCase()) {
                    this._content = $(`<video class='${prefix}-content ${prefix}-content-video' controls="controls"><source src="${this.material.url}"></video>`);

                }
                else if (this.material.type.toLowerCase() == FileType.PDF.toLowerCase()) {
                    this._content = $(`<div class='${prefix}-content'></div>`);
                }
                else {
                    this._content = $(`<div class='${prefix}-content'><h2>No data to display</h2></div>`);
                    //this._content = $(`<div class='${prefix}-content'><a class="media" href="${this.material.url}"></a></div>`);
                }
            }

            if (this.content) {
                this.element.append(this.content);
                this.resize();
                //this.content.find('.media').media();
                if (this.material.type.toLowerCase() == FileType.PDF.toLowerCase())
                    PDFObject.embed(this.material.url, this._content);
            }

            if (this.info != null)
                this.info.displayMaterial(material);
        }

        // clear GalleryViewer content
        clear() {
            if (this.content != null)
                this.content.remove();

            this._content = null;
            this._contentOriginalWidth = 0;
            this._contentOriginalHeight = 0;

            if (this.info != null)
                this.info.displayMaterial(null);
        }

        // resize Image by current view sizes
        resize(width, height, margins) {
            if (width == undefined) width = this._options.width;
            if (height == undefined) height = this._options.height;
            if (margins == undefined) margins = this._options.margins;

            this._options.width = width;
            this._options.height = height;
            this._options.margins = margins;

            if (this.element == null || this.material == null)
                return;

            if (this.content == null || this._contentOriginalWidth <= 0 || this._contentOriginalHeight <= 0)
                return;

            let marginTop = this._options.margins ? this._options.margins.top || 0 : 0;
            let marginBottom = this._options.margins ? this._options.margins.bottom || 0 : 0;
            if (this.info != null && this.info.isVisible)
                marginBottom += this.info.element.innerHeight();

            // we'd like to have no interception with info block
            if (this.material.type.toLowerCase() == FileType.Image.toLowerCase()) {
                marginTop = 0;
                marginBottom = 0;
            }

            let coefficient = Math.min(width / this._contentOriginalWidth, (height - marginTop - marginBottom) / this._contentOriginalHeight);

            let css = {
                width: this._contentOriginalWidth * coefficient,
                height: this._contentOriginalHeight * coefficient,
                'margin-top': marginTop + 'px',
                'margin-bottom': marginBottom + 'px'
            };

            //this._content.find('embed').css({height: 'auto'});
            this._content.css(css);
        }

        // download current Material
        download() {
            if (this.material == null || this.element == null)
                return;

            var elementDOM = this.element[0];
            var url = this.material.url;
            var filename = this.material.filename || url.substring(url.lastIndexOf("/") + 1).split("?")[0];

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function () {
                let a = document.createElement('a');
                a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
                a.download = filename; // Set the file name.
                a.style.display = 'none';
                elementDOM.appendChild(a);
                a.click();
                elementDOM.removeChild(a);
            };
            xhr.open('GET', url, true);
            xhr.send();
        }

        // create GalleryViewer by Material and Options
        static create(width, height, margins, options, material) {
            let result = new SXMediaGalleryViewer({
                width: width,
                height: height,
                margins: margins
            });

            if (material != undefined)
                result.displayMaterial(material);

            return result;
        }
    }

    class SXMediaGalleryViewerInfo {
        constructor(options) {
            this._defaults = {visible: true};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-viewer-info";

            this._element = $(`<div class='${this._prefix}'></div>`);

            this._date = $(`<span class='${this._prefix}-date'></span>`);
            this._title = $(`<span class='${this._prefix}-title'></span>`);

            this._header = $(`<h1 class='${this._prefix}-header'></h1>`);
            this._header.append(this._date);
            this._header.append(this._title);
            this._element.append(this._header);

            this._comment = $(`<div class='${this._prefix}-comment'></div>`);
            this._element.append(this._comment);

            this.display(this._options.visible);
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get isVisible() {
            return this._isVisible;
        }

        display(visible) {
            if (this.element == null)
                throw new Error('Viewer Info DOM element was destroyed!');

            if (visible == undefined || visible) {
                this._isVisible = true;
                this.element.show();
            }
            else {
                this._isVisible = false;
                this.element.hide();
            }

            this.element.trigger(`${pluginPrefix}-InfoDisplayChanged`, {visible: this.isVisible});
        }

        show() {
            this.display(true);
        }

        hide() {
            this.display(false);
        }

        toggle() {
            this.display(!this.isVisible);
        }

        // display GalleryViewer content
        displayMaterial(material) {
            this._date.text(material ? (material.dateString + ' ') : '');
            this._title.text(material ? material.title || '' : '');
            this._comment.text(material ? material.comment || '' : '');
        }
    }

    class SXMediaGalleryButton {
        constructor(options) {
            this._defaults = {type: 'button', name: 'name', src: '', handler: null};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-" + this.type;

            this._element = $(`<a class='${this._prefix} ${this._prefix}-${this.name} unselectable'><img ${this._options.src ? `src='${this._options.src}'` : ''}></a>`);

            if (this.handler != null)
                this.element.click(this.handler);
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get type() {
            return this._options.type;
        }

        get name() {
            return this._options.name;
        }

        get handler() {
            return this._options.handler == undefined ? null : this._options.handler;
        }

        changeState(isActive) {
            if (this.element == null)
                return;

            if (isActive)
                this.element.addClass('active');
            else
                this.element.removeClass('active');
        }

        static create(type, name, src, handler) {
            return new SXMediaGalleryButton({type: type, name: name, src: src, handler: handler});
        }
    }

    class SXMediaGalleryMenu {
        constructor(options) {
            this._defaults = {};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-menu";

            this._element = $(`<div class='${this._prefix}'></div>`);

            this._buttons = [];
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get buttons() {
            if (this._buttons == undefined || this._buttons == null || !(this._buttons instanceof Array))
                this._buttons = [];
            return this._buttons;
        }

        addButton(button) {
            if (button == undefined || button == null || !(button instanceof SXMediaGalleryButton))
                throw new Error('Wrong Button specified!');

            if (this.element == null)
                throw new Error('Menu DOM element was destroyed!');

            if (button.element == null)
                throw new Error("Button DOM element was destroyed!");

            this.buttons.push(button);

            this.element.append(button.element);
        }

        findButton(name) {
            if (this.buttons != null)
                for (let i = 0; i < this.buttons.length; i++)
                    if (this.buttons[i].name.toLowerCase() == name.toLowerCase())
                        return this.buttons[i];

            return null;
        }

        changeButtonState(name, isActive) {
            let button = this.findButton(name);
            if (button != null)
                button.changeState(isActive);
        }
    }

    class SXMediaGalleryDesk {
        constructor(options) {
            this._defaults = {};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-desk";

            this._element = $(`<div class='${this._prefix}'></div>`).css('display', 'none');

            this._isVisible = false;
            this._materials = [];
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get isVisible() {
            return this._isVisible == undefined || this._isVisible == null ? false : this._isVisible;
        }

        get materials() {
            if (!this._materials || !(this._materials instanceof Array))
                this._materials = [];
            return this._materials;
        }

        display(visible) {
            if (visible == undefined || visible) {
                this._isVisible = true;
                this.element.show();
            }
            else {
                this._isVisible = false;
                this.element.hide();
            }

            this.element.trigger(`${pluginPrefix}-DeskDisplayChanged`, {visible: this.isVisible});
        }

        show() {
            this.display(true);
        }

        hide() {
            this.display(false);
        }

        toggle() {
            this.display(!this.isVisible);
        }

        addMaterial(material, clickHandler) {
            if (!material || !(material instanceof SXMediaMaterial))
                throw new Error('Wrong Material specified!');

            if (this.element == null)
                throw new Error('Desk DOM element was destroyed!');

            this.materials.push(material);

            let item = $(`<div class='${this._prefix}-item'></div>`);

            if (material.thumbnail)
                item.append($(`<img class='${this._prefix}-item-avatar' src='${material.thumbnail}'>`));

            if (clickHandler)
                item.click(clickHandler);

            this.element.append(item);
        }
    }

    class SXMediaGalleryPanel {
        constructor(options) {
            jQuery.event.special.swipe.settings.threshold = 0.2;
            //jQuery.event.special.swipe.settings.sensitivity = 1;

            this._defaults = {infoVisible: true, allowDuplicates: false};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-panel";

            this._isVisible = false;
            this._materials = [];

            // create Panel element and handle events
            this._element = $(`<div class='${this._prefix}'></div>`).css('display', 'none');
            //this.element.load(this.resize.bind(this));
            this.element.click(function (event) {
                event.stopPropagation();
            });
            this.element.on('swiperight', this.movePrevious.bind(this));
            this.element.on('swipeleft', this.moveNext.bind(this));

            // on Info display changed
            this.element.on(`${pluginPrefix}-InfoDisplayChanged`, function (event, data) {
                this.menu.changeButtonState('info', data.visible);
            }.bind(this));

            // on Desk display changed
            this.element.on(`${pluginPrefix}-DeskDisplayChanged`, function (event, data) {
                this.menu.changeButtonState('desk', data.visible);
            }.bind(this));

            // add arrows to move left & right
            this.element.append(SXMediaGalleryButton.create('panel-arrow', 'left', IconCollection.ArrowLeft, this.movePrevious.bind(this)).element);
            this.element.append(SXMediaGalleryButton.create('panel-arrow', 'right', IconCollection.ArrowRight, this.moveNext.bind(this)).element);

            // create Viewer
            this._viewer = SXMediaGalleryViewer.create(this.element.width(), this.element.height(), this.margins, this._options);
            this.element.append(this.viewer.element);

            // create Desk
            this._desk = new SXMediaGalleryDesk();
            this.element.append(this.desk.element);

            // crete Menu and fill with buttons
            this._menu = new SXMediaGalleryMenu();
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'desk', IconCollection.Menu, this.desk.toggle.bind(this.desk)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'info', IconCollection.Profile, this.viewer.info.toggle.bind(this.viewer.info)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'download', IconCollection.Download, this.viewer.download.bind(this.viewer)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'close', IconCollection.Close, this.close.bind(this)));
            this.element.append(this.menu.element);

            // highlight the info-button if needed
            this.menu.changeButtonState('info', this.viewer.info.isVisible);
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get isVisible() {
            return this._isVisible == undefined || this._isVisible == null ? false : this._isVisible;
        }

        get allowDuplicates() {
            return !!this._options.allowDuplicates;
        }

        get menu() {
            return this._menu == undefined ? null : this._menu;
        }

        get viewer() {
            return this._viewer == undefined ? null : this._viewer;
        }

        get desk() {
            return this._desk == undefined ? null : this._desk;
        }

        get materials() {
            if (this._materials == undefined || this._materials == null || !(this._materials instanceof Array))
                this._materials = [];

            return this._materials;
        }

        //get Count of Materials in Collection
        get count() {
            return this.materials.length;
        }

        //get current Material object
        get material() {
            return this.viewer == null ? null : this.viewer.material;
        }

        //get index of current Material in Materials Collection
        get index() {
            if (this.materials == null || this.material == null)
                return -1;
            return this.materials.indexOf(this.material);
        }

        get margins() {
            // top margin with menu
            let top = this.menu && this.menu.element ? this.menu.element.innerHeight() : 0;

            return {
                top: top,
                right: 0,
                bottom: 0,
                left: 0
            };
        }

        display(visible) {
            if (visible == undefined || visible) {
                this._isVisible = true;
                this.element.show();
                this.resize();
            }
            else {
                this._isVisible = false;
                this.element.hide();
            }
        }

        hide() {
            this.display(false);
        }

        show(material) {
            if (material != undefined)
                this.displayMaterial(material);

            this.display(true);
        }

        //close panel of Gallery or close Desk
        close() {
            if (this.desk != null && this.desk.isVisible) {
                this.desk.hide();
            }
            else {
                if (this.viewer != null)
                    this.viewer.clear();
                this.hide();
            }
        }

        //add object(objects) to Materials Collection
        addMaterial(obj) {
            if (obj == null || obj == undefined)
                return;

            if (obj instanceof SXMediaMaterial) {
                if (this.allowDuplicates || this.findMaterial(obj.id) == null) {
                    this.materials.push(obj);
                    this.desk.addMaterial(obj, function () {
                        this.displayMaterial(obj);
                        this.desk.hide();
                    }.bind(this));
                }
            }
            else if (obj instanceof Array) {
                for (let i = 0; i < obj.length; i++)
                    this.addMaterial(obj[i]);
            }
            else if (typeof obj == 'object') {
                this.addMaterial(new SXMediaMaterial(obj));
            }
        }

        //find Material in Collection by id
        findMaterial(id) {
            if (id == null || id == undefined)
                return null;

            for (let i = 0; i < this.count; i++) {
                //if (typeof id == 'string' && this.materials[i].id.toLowerCase() == id.toLowerCase())
                //    return this.materials[i];
                if (this.materials[i].id == id)
                    return this.materials[i];
            }

            return null;
        }

        moveTo(index) {
            let count = this.count;
            if (count <= 0)
                return;

            if (index >= count)
                index = count - 1;
            if (index < 0)
                index = 0;

            this.displayMaterial(this.materials[index]);
        }

        moveNext() {
            this.moveTo(this.index + 1);
        }

        movePrevious() {
            this.moveTo(this.index - 1);
        }

        //resize the Gallery
        resize() {
            if (this.element != null && this.viewer != null) {
                this.viewer.resize(this.element.width(), this.element.height(), this.margins);
            }
        }

        //display specific Material in panel
        displayMaterial(obj) {
            let material = null;

            if (obj == null || obj == undefined)
                material = null;
            else if (obj instanceof SXMediaMaterial)
                material = obj;
            else if (typeof obj == 'object')
                material = new SXMediaMaterial(obj);
            else //if (typeof obj == 'string')
                material = this.findMaterial(obj);
            //else
            //    throw new Error('Invalid Material specified!');

            if (this.viewer != null) {
                this.viewer.displayMaterial(material);
            }
        }
    }

    class SXMediaGallery {
        constructor(element, options) {
            this._defaults = {infoVisible: true, allowDuplicates: false};
            this._options = $.extend({}, this._defaults, options);
            this._prefix = pluginPrefix;

            this._element = $(element);

            this._panel = new SXMediaGalleryPanel(this._options);

            // добавляем новую панель к документу
            $("body").append(this.panel.element);

            // обновляем размеры панели и просмотрщика,
            // так как объекты были добавлены в DOM
            $(window).load(this.panel.resize.bind(this.panel));

            // при нажатии на документ вне панели - нужно закрыть панель
            $(document).click(this.panel.close.bind(this.panel));

            // on Window resize we should resize our Gallery
            $(window).resize(this.panel.resize.bind(this.panel));

            // при нажатии на элемент нужно отобразить панель с этим элементом
            $(element).on('click', `.${this._prefix}-item`, function (event) {
                this.panel.show($(event.target).data('id'));
                event.stopPropagation();
            }.bind(this));

            //добавляем все HTML элементы в коллекцию материалов
            this.reload(this._options.items);
        }

        get element() {
            return this._element == undefined ? null : this._element;
        }

        get panel() {
            return this._panel == undefined ? null : this._panel;
        }

        reload(materials) {
            if (this.panel == null)
                return;

            if (materials == undefined) {
                //добавляем все HTML элементы в коллекцию материалов
                this.element.find(`.${this._prefix}-item`).each(function (index, element) {
                    let id = $(element).data('id');
                    let type = $(element).data('type');
                    let url = $(element).data('url');
                    let thumbnail = $(element).data('thumbnail');
                    let date = $(element).data('date');
                    let title = $(element).data('title');
                    let comment = $(element).data('comment');
                    this.panel.addMaterial(new SXMediaMaterial({
                        id: id,
                        type: type,
                        url: url,
                        thumbnail: thumbnail,
                        date: date,
                        title: title,
                        comment: comment
                    }));
                }.bind(this));
            }
            else {
                this.panel.addMaterial(materials);
            }
        }
    }

    // A really lightweight plugin wrapper around the constructor, preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new SXMediaGallery(this, options));
            }
        });
    }

})(jQuery, window, document);