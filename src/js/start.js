/*global define*/
define([
    'jquery',
    'loglevel',
    'faostat-ui/config/Config',
    'faostat-ui/config/Routes',
    'faostat-ui/config/Events',
    'faostat-ui/globals/Common',
    'handlebars',
    'text!faostat_ui_welcome_page/html/templates.hbs',
    //'i18n!faostat_ui_welcome_page/nls/translate',
    'i18n!nls/download',
    'faostatapiclient',
    'faostat-ui/lib/download/go_to_section/go-to-section',
    'amplify'
], function ($, log, C, ROUTE, E, Common, Handlebars, templates, translate, FAOSTATAPIClient, GoToSection) {

    'use strict';

    function WELCOME_PAGE() {

        this.s = {

            WELCOME_TEXT: '#welcome_text',
            WELCOME_SECTION: '#welcome_section'

        };

        this.CONFIG = {

            // TODO: CONFIG is not passed!

            //lang: 'en',
            prefix: 'faostat_ui_welcome_page_',
            placeholder_id: 'faostat_ui_welcome_page',
            isRendered: false,
            domain_name: undefined,
            domain_code: undefined,
            base_url: 'http://faostat3.fao.org/faostat-documents/',

            // TODO: move to a common download section
            sections: [
                {
                    id: ROUTE.DOWNLOAD_WELCOME,
                    name: translate.about
                },
                {
                    id: ROUTE.DOWNLOAD_INTERACTIVE,
                    name: translate.interactive_download_title
                },
                {
                    id: ROUTE.DOWNLOAD_BULK,
                    name: translate.bulk_downloads_title
                },
                {
                    id: ROUTE.DOWNLOAD_METADATA,
                    name: translate.metadata_title
                }
            ]

        };

    }

    WELCOME_PAGE.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        //this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

        /* Render, if needed. */
        if (this.CONFIG.isRendered === false) {
            this.render();
        }

    };

    WELCOME_PAGE.prototype.render = function () {

        /* Variables. */
        var self = this,
            documents = [],
            i;

        /* Query DB for available files. */
        this.CONFIG.api.documents({
            datasource: C.DATASOURCE,
            domain_code: this.CONFIG.domain_code,
            lang: Common.getLocale()
        }).then(function (data) {

            for (i = 0; i < data.data.length; i += 1) {

                if (data.data[i].FileTitle !== 'About') {
                    documents.push({
                        FileName: data.data[i].FileName,
                        FileTitle: data.data[i].FileTitle,
                        FileContent: data.data[i].FileContent,
                        base_url: self.CONFIG.base_url
                    });
                } else {
                    $.get(self.CONFIG.base_url + data.data[i].FileName, function(response) {
                        amplify.publish(E.LOADING_HIDE, {container: self.s.WELCOME_TEXT});
                        $(self.s.WELCOME_TEXT).html(response);
                    });
                }

            }

            self.load_template(documents);

        });

    };

    WELCOME_PAGE.prototype.load_template = function (documents) {

        amplify.publish(E.LOADING_SHOW, {container: this.s.WELCOME_TEXT});

        /* Variables. */
        var source = $(templates).filter('#faostat_ui_welcome_page_structure').html(),
            template = Handlebars.compile(source),
            hasDocuments = documents.length > 0,
            data = {
                domain_name: this.CONFIG.domain_name,
                hasDocuments: hasDocuments,
                documents: documents,
                //sections: this.CONFIG.sections
            },
            html = template($.extend(true, {}, data, translate)),
            self = this;

        /* Load main structure. */
        $('#' + this.CONFIG.placeholder_id).html(html);

        /* Set rendered flag. */
        this.CONFIG.isRendered = true;


        // add go to section
       new GoToSection().init({
           container: $('#' + this.CONFIG.placeholder_id).find(this.s.WELCOME_SECTION),
           domain_code: this.CONFIG.domain_code
       });

    };

    WELCOME_PAGE.prototype.isNotRendered = function () {
        return !this.CONFIG.isRendered;
    };

    WELCOME_PAGE.prototype.dispose = function () {
        $('#' + this.CONFIG.placeholder_id).empty();
    };

    return WELCOME_PAGE;

});