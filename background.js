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

function getSelection() {
    return window.getSelection().toString();
}

function copyTextWithURL(tab, copy_mode) {
    // console.log("called copyTextWithURL");
    let url = tab.url;
    let tabId = tab.id;
    chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: getSelection
        },
        (res) => {
            let selection = res[0].result;
            if (selection.length > 0) {
                console.log("selected_text", selection);
                let text = "---"
                if (copy_mode === "plain") {
                    text = selection + "\n" + url;
                } else if (copy_mode === "markdown") {
                    text = "[" + selection + "](" + url + ")";
                }
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabId },
                        func: copyToClipboard,
                        args: [text],
                    },
                    (res) => {
                        let options = {
                            type: "basic",
                            iconUrl: "./images/icon_128.png",
                            title: "Copied as " + copy_mode + " text.",
                            message: "\"" + selection + "\"",
                        }
                        chrome.notifications.create(`copy_with_text_notification-${Date.now()}`, options);

                    });
            } else {
                alert("TODO no selected text");
            }

        });
}

chrome.commands.onCommand.addListener(function (command) {
    // console.log("onCommand:", command);
    let copy_mode = null;
    if (command === "copy-text-with-url-as-plain") {
        copy_mode = "plain"
    } else if (command === "copy-text-with-url-as-markdown") {
        copy_mode = "markdown"
    } else {
        alert("Unknown command: " + command);
    }

    // console.log("copy mode", copy_mode);
    if (copy_mode !== undefined) {
        // console.log("call tabs.query to activeTab");
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            console.log("call copyTextWithURL");
            copyTextWithURL(tabs[0], copy_mode);
        });
    }
});

