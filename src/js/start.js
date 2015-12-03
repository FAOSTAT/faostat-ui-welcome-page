/*global define*/
define(['jquery',
        'config/Config',
        'handlebars',
        'text!faostat_ui_welcome_page/html/templates.hbs',
        'i18n!faostat_ui_welcome_page/nls/translate',
        'faostatapiclient',
        'bootstrap',
        'sweetAlert',
        'amplify'], function ($, C, Handlebars, templates, translate, FAOSTATAPIClient) {

    'use strict';

    function WELCOME_PAGE() {

        this.CONFIG = {

            lang: 'en',
            prefix: 'faostat_ui_welcome_page_',
            placeholder_id: 'faostat_ui_welcome_page',
            url_wds_crud: 'http://fenixapps2.fao.org/wds_5.1/rest/crud',
            isRendered: false,
            domain_name: undefined,
            domain_code: undefined,
            base_url: 'http://faostat.fao.org/Portals/_Faostat/Downloads/FAOSTATFiles/'

        };

    }

    WELCOME_PAGE.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

        /* Render, if needed. */
        if (this.CONFIG.isRendered === false) {
            this.render();
        }

    };

    WELCOME_PAGE.prototype.render = function () {

        /* Variables. */
        var that = this,
            documents = [],
            i;

        /* Query DB for available files. */
        this.CONFIG.api.documents({
            datasource: C.DATASOURCE,
            domain_code: this.CONFIG.domain_code
        }).then(function (data) {
            for (i = 0; i < data.data.length; i += 1) {
                documents.push({
                    FileName: data.data[i].FileName,
                    FileTitle: data.data[i].FileTitle,
                    FileContent: data.data[i].FileContent,
                    base_url: that.CONFIG.base_url
                });
            }
            that.load_template(documents);
        });

    };

    WELCOME_PAGE.prototype.load_template = function (documents) {

        /* Variables. */
        var source,
            template,
            dynamic_data,
            html,
            hasDocuments = documents.length > 0;

        /* Load main structure. */
        source = $(templates).filter('#faostat_ui_welcome_page_structure').html();
        template = Handlebars.compile(source);
        dynamic_data = {
            title: translate.title,
            text: translate.text,
            interactive_download_title: translate.interactive_download_title,
            interactive_download_text: translate.interactive_download_text,
            bulk_downloads_title: translate.bulk_downloads_title,
            bulk_downloads_text: translate.bulk_downloads_text,
            metadata_title: translate.metadata_title,
            metadata_text: translate.metadata_text,
            related_documents: translate.related_documents,
            domain_name: this.CONFIG.domain_name,
            hasDocuments: hasDocuments,
            documents: documents
        };
        html = template(dynamic_data);
        $('#' + this.CONFIG.placeholder_id).html(html);

        /* Set rendered flag. */
        this.CONFIG.isRendered = true;

    };

    WELCOME_PAGE.prototype.isNotRendered = function () {
        return !this.CONFIG.isRendered;
    };

    WELCOME_PAGE.prototype.dispose = function () {
        $('#' + this.CONFIG.placeholder_id).empty();
    };

    return WELCOME_PAGE;

});