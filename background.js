'use strict';

function copyToClipboard(text) {
    console.log("called copyToClipboard", text);
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
};

function copyTextWithURL(tab, copy_mode) {
    console.log("called copyTextWithURL");
    let url = tab.url;
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
        console.log("selection", selection);
        if (selection.length > 0) {
            let selected_text = selection[0];
            console.log("selected_text", selected_text);
            if (copy_mode === "plain") {
                copyToClipboard(selected_text + "\n" + url);
            } else if (copy_mode === "markdown") {
                copyToClipboard("[" + selected_text + "](" + url + ")");
            }
            let options = {
                type: "basic",
                iconUrl: "./images/icon_128.png",
                title: "Copied as " + copy_mode + "!",
                message: "\"" + selected_text + "\"",
            }
            console.log("call notifications");
            chrome.notifications.create('copy_with_text_notification', options);
        } else {
            alert("TODO no selected text");
        }
    });
}

chrome.commands.onCommand.addListener(function(command) {
    console.log("onCommand:", command);
    let copy_mode = null;
    if (command === "copy-text-with-url-as-plain") {
        copy_mode = "plain"
    } else if (command === "copy-text-with-url-as-markdown") {
        copy_mode = "markdown"
    } else {
        alert("Unknown command: " + command);
    }

    console.log("copy mode", copy_mode);
    if (copy_mode !== undefined) {
        console.log("call tabs.query to activeTab");
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            console.log("call copyTextWithURL");
            copyTextWithURL(tabs[0], copy_mode);
        });
    }
});

chrome.browserAction.onClicked.addListener(copyTextWithURL);
