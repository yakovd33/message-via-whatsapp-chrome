$(document).ready(() => {
    const $select = $('#country')
    const $phone = $('#phone')
    const $send = $('#send')
    const $reset = $('#resetCountry')
    const $toggle = $('#toggleIcons')

    countries.forEach(c => {
        $select.append(new Option(`${c.name} (+${c.code})`, c.code))
    })

    $select.select2({ placeholder: 'Select a country', width: 'resolve' })

    chrome.storage.local.get(['country', 'injectIcons'], (res) => {
        if (res.country) $select.val(res.country).trigger('change')
        if (res.injectIcons === false) $toggle.prop('checked', false)
        else $toggle.prop('checked', true)
    })

    $select.on('change', () => {
        chrome.storage.local.set({ country: $select.val() })
    })

    $toggle.on('change', () => {
        chrome.storage.local.set({ injectIcons: $toggle.prop('checked') })
    })

    $send.on('click', () => {
        const phone = $phone.val().replace(/\D/g, '')
        const full = $select.val() + phone
        chrome.tabs.create({ url: `https://wa.me/${full}` })
    })

    $reset.on('click', () => {
        fetch('https://ipapi.co/json')
            .then(res => res.json())
            .then(data => {
                const match = countries.find(c => c.name.toLowerCase() === data.country_name.toLowerCase())
                if (match) {
                    $select.val(match.code).trigger('change')
                    chrome.storage.local.set({ country: match.code })
                }
            })
    })
})
