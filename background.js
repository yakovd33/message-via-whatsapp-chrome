chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "sendWhatsAppTel",
        title: "Send WhatsApp to link number",
        contexts: ["link"]
    })

    chrome.contextMenus.create({
        id: "sendWhatsAppSelected",
        title: "Send WhatsApp to selected number",
        contexts: ["selection"]
    })
})

chrome.contextMenus.onClicked.addListener((info) => {
    let raw = ''

    if (info.menuItemId === "sendWhatsAppTel") {
        raw = info.linkUrl || ''
    }

    if (info.menuItemId === "sendWhatsAppSelected") {
        raw = info.selectionText || ''
    }

    const clean = raw.replace(/[^\d+]/g, '')

    if (!clean.match(/\d{6,}/)) return

    chrome.storage.local.get(['country'], (res) => {
        const countryCode = res.country || '972'
        let number = clean

        if (number.startsWith('+')) {
            number = number.substring(1)
        } else if (number.startsWith('00')) {
            number = number.substring(2)
        } else if (number.startsWith('0')) {
            number = countryCode + number.substring(1)
        } else {
            number = countryCode + number
        }

        const url = `https://wa.me/${number}`
        chrome.tabs.create({ url })
    })
})
