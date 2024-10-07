// ==UserScript==
// @name         Voices.com Helper
// @namespace    http://jskva.com/
// @version      2024-11-09
// @description  Several improvements to the Voices.com website
// @author       Jonathan Kelly <jskva@jskva.com>
// @match        https://www.voices.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voices.com
// @downloadURL  https://github.com/jonathankellyva/vdc-helper/raw/stable/vdc-helper.user.js
// @updateURL    https://github.com/jonathankellyva/vdc-helper/raw/stable/vdc-helper.user.js
// ==/UserScript==

// The Voices.com Helper Tampermonkey script is now deprecated in favor of the
// Voices.com Browser Extension. For migration instructions, please see
// https://github.com/jonathankellyva/vdc-helper/wiki/Browser-Extension-Migration

(function () {
    'use strict';

    const mainPage = document.getElementById('main-page');
    if (mainPage) {
        const deprecationNotice = document.createElement('div');
        deprecationNotice.className = 'alert alert-danger';
        deprecationNotice.innerHTML = '<p>The Voices.com Helper Tampermonkey script is now deprecated in favor of the ' +
            'Voices.com Helper browser extension. Please see <a href="' +
            'https://github.com/jonathankellyva/vdc-helper/wiki/Browser-Extension-Migration' +
            '" target="_blank">here</a> for migration instructions.</p>';
        mainPage.insertBefore(deprecationNotice, mainPage.firstChild);
    }
})();
