/*global define*/
define(['jquery',
        'handlebars',
        'text!faostat_ui_welcome_page/html/templates.html',
        'i18n!faostat_ui_welcome_page/nls/translate',
        'bootstrap',
        'sweetAlert',
        'amplify'], function ($, Handlebars, templates, translate) {

    'use strict';

    function WELCOME_PAGE() {

        this.CONFIG = {

            lang: 'en',
            prefix: 'faostat_ui_welcome_page_',
            placeholder_id: 'faostat_ui_welcome_page',
            url_wds_crud: 'http://fenixapps2.fao.org/wds_5.1/rest/crud'

        };

    }

    WELCOME_PAGE.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

    };

    WELCOME_PAGE.prototype.dispose = function () {

    };

    return WELCOME_PAGE;

});