$(document).ready(() => {
    const $select = $('#country')
    const $phone = $('#phone')
    const $send = $('#send')
    const $reset = $('#resetCountry')
    const $toggle = $('#toggleIcons')
    const $consent = $('#consent')
    const $agree = $('#consentYes')
    const $decline = $('#consentNo')

    countries.forEach(c => {
        $select.append(new Option(`${c.name} (+${c.code})`, c.code))
    })

    $select.select2({ placeholder: 'Select a country', width: 'resolve' })

    chrome.storage.local.get(['country','injectIcons','ipapiConsent'], (res) => {
        if (res.country) $select.val(res.country).trigger('change')
        $toggle.prop('checked', res.injectIcons !== false)

        if (typeof res.ipapiConsent === 'undefined') {
            $consent.show()
        } else if (res.ipapiConsent === true && !res.country) {
            detectAndSetCountry()
        }
    })

    $select.on('change', () => {
        chrome.storage.local.set({ country: $select.val() })
    })

    $toggle.on('change', () => {
        chrome.storage.local.set({ injectIcons: $toggle.prop('checked') })
    })

    $send.on('click', () => {
        const phone = $phone.val().replace(/\D/g, '')
        if (!phone) return
        const full = $select.val() + phone
        chrome.tabs.create({ url: `https://wa.me/${full}` })
    })

    $reset.on('click', () => {
        chrome.storage.local.get(['ipapiConsent'], (res) => {
            if (res.ipapiConsent === true) {
                detectAndSetCountry()
            } else {
                $consent.show()
            }
        })
    })

    $agree.on('click', () => {
        chrome.storage.local.set({ ipapiConsent: true }, () => {
            detectAndSetCountry()
            $consent.hide()
        })
    })

    $decline.on('click', () => {
        chrome.storage.local.set({ ipapiConsent: false })
        $consent.hide()
    })

    function detectAndSetCountry() {
        fetch('https://ipapi.co/json')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                const name = (data && data.country_name || '').toLowerCase()
                const match = countries.find(c => c.name.toLowerCase() === name)
                if (match) {
                    $select.val(match.code).trigger('change')
                    chrome.storage.local.set({ country: match.code })
                }
            })
            .catch(() => {})
    }
})
