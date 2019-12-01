'use strict';

function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
};

function copyTextWithURL(tab) {
    let url = tab.url;
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
        if (selection.length > 0) {
            let selected_text = selection[0];
            copyToClipboard(selected_text + "\n" + url);
            let options = {
                type: "basic",
                iconUrl: "./images/icon_128.png",
                title: "Copied with URL!",
                message: "\"" + selected_text + "\"",
            }
            chrome.notifications.create('copy_with_text_notification', options);
        } else {
            alert("TODO no selected text");
        }
    });
}

chrome.commands.onCommand.addListener(function(command) {
    if (command === "copy-text-with-url") {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            copyTextWithURL(tabs[0]);
        });
    } else {
        alert("Unknown command: " + command);
    }
});

chrome.browserAction.onClicked.addListener(copyTextWithURL);
