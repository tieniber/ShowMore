/*global logger*/
/*
    ShowMore
    ========================

    @file      : ShowMore.js
    @version   : 1.0.0
    @author    : Eric Tieniber
    @date      : 9/19/2016
    @copyright : Eric Tieniber 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",

    "dojo/text!ShowMore/widget/template/ShowMore.html"
], function(declare, _WidgetBase, _TemplatedMixin, dojoClass, dojoLang, on, dojoArray, widgetTemplate) {
    "use strict";

    // Declare widget's prototype.
    return declare("ShowMore.widget.ShowMore", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        shortTextNode: null,
        fullTextNode: null,
        moreLink: null,

        // Parameters configured in the Modeler.
        textDataAttr: "",
        showChars: 80,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        ellipsestext: "...",
        moretext: "More",
        lesstext: "Less",
        textData: "",
        _handles: null,
        shortText: "",
        _showingAll: false,
        _clickHandles: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            logger.debug(this.id + ".constructor");
            this._handles = [];
            this._clickHandles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            this.moreLink.innerHTML = this.moretext;
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;

            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        _updateRendering: function(callback) {
            if (this._contextObj) {
                this.textData = this._contextObj.get(this.textDataAttr);

                if (this.textData.length > this.showChars) {
                    this.shortText = this.textData.substr(0, this.showChars); // chop at length defined.
                    var goodStop = this.shortText.lastIndexOf(' '); // find the last space to not chop in the middle of words.
                    this.shortText = this.shortText.substr(0, goodStop) + this.ellipsestext; // use the goodStop to chop.
                    if (this.textNode) {
                        if (this._showingAll) {
                            this.moreLink.innerHTML = this.lesstext;
                            this.textNode.innerHTML = this.textData;
                        } else {
                            this.moreLink.innerHTML = this.moretext;
                            this.textNode.innerHTML = this.shortText;
                        }
                    }

                    if (this.moreLink) {
                        var i = this._clickHandles.length;
                        while (i--) {
                            var removeHandle = this._clickHandles.pop();
                            dojo.disconnect(removeHandle);
                        }

                        var handle = on(this.moreLink, "click", dojoLang.hitch(this, this._toggle));
                        this._clickHandles.push(handle);
                    }
                } else {
                    if (this.textNode) {
                        this.textNode.innerHTML = this.textData; //this.textNode.innerHTML;
                    }

                    if (this.moreLink) {
                        dojoClass.add(this.moreLink, "hidden");
                    }
                }
            }

            if (callback) {
                callback()
            };
        },

        _toggle: function() {


            if (this._showingAll) {
                this.moreLink.innerHTML = this.moretext;
                this.textNode.innerHTML = this.shortText;
            } else {
                this.moreLink.innerHTML = this.lesstext;
                this.textNode.innerHTML = this.textData;
            }

            this._showingAll = !this._showingAll;

        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
            logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
            logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        _unsubscribe: function() {
            if (this._handles) {
                dojoArray.forEach(this._handles, function(handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.textDataAttr,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this._handles = [objectHandle, attrHandle];
            }
        }
    });
});

require(["ShowMore/widget/ShowMore"]);
