// More flexible phone pattern: allows varied groupings (e.g., +34 612 34 56 78, +39 06 6982)
// Strategy: match a possible international prefix, optional area/leading group, then a series of blocks with separators.
// We post-filter by total digit count (7-15) to reduce false positives.
const phoneRegex = /(?<!\w)(?:\+|00)?\d[\d\s().-]{5,}\d(?!\w)/g
const MIN_PHONE_DIGITS = 7
const MAX_PHONE_DIGITS = 15

const localeToCode = {
    'he-il': '972','en-us': '1','en-gb': '44','fr-fr': '33','de-de': '49','es-es': '34','it-it': '39','pt-br': '55','pt-pt': '351','ru-ru': '7','ar-sa': '966','ar-ae': '971','tr-tr': '90','nl-nl': '31','pl-pl': '48','sv-se': '46','no-no': '47','da-dk': '45','fi-fi': '358','ja-jp': '81','ko-kr': '82','zh-cn': '86','zh-tw': '886','hi-in': '91','id-id': '62','th-th': '66','vi-vn': '84','uk-ua': '380','ro-ro': '40','bg-bg': '359','cs-cz': '420','sk-sk': '421','el-gr': '30','hu-hu': '36','ie-ie': '353','is-is': '354','au-en': '61','nz-en': '64','ca-en': '1','ca-fr': '1'
}

function getFallbackCode(stored) {
    if (stored) return stored
    const lang = (navigator.language || '').toLowerCase()
    if (localeToCode[lang]) return localeToCode[lang]
    const parts = lang.split('-')
    if (parts.length === 2) {
        const guess = Object.keys(localeToCode).find(k => k.endsWith('-' + parts[1]))
        if (guess) return localeToCode[guess]
    }
    return '972'
}

function isInSVG(node) {
    let n = node && node.parentNode
    while (n) {
        if (n.namespaceURI === 'http://www.w3.org/2000/svg') return true
        n = n.parentNode
    }
    return false
}

function getSafeTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const p = node.parentNode
            if (!p) return NodeFilter.FILTER_REJECT
            if (isInSVG(node)) return NodeFilter.FILTER_REJECT
            if (p.isContentEditable) return NodeFilter.FILTER_REJECT
            const tag = p.nodeName.toLowerCase()
            if (['script','style','textarea','input','code','pre','select','option'].includes(tag)) return NodeFilter.FILTER_REJECT
            return NodeFilter.FILTER_ACCEPT
        }
    })
    const nodes = []
    let n
    while ((n = walker.nextNode())) nodes.push(n)
    return nodes
}

function parsePhoneNumber(raw, countryCode) {
    const clean = raw.replace(/[^\d+]/g, '')
    if (clean.startsWith('+')) return clean.slice(1)
    if (clean.startsWith('00')) return clean.slice(2)
    if (clean.startsWith('0')) return countryCode + clean.slice(1)
    return countryCode + clean
}

function wrapNodeWithIcons(textNode) {
    // Avoid double-processing
    if (textNode.__wa_processed) return;
    textNode.__wa_processed = true;
    const text = textNode.nodeValue;
    phoneRegex.lastIndex = 0;
    let last = 0;
    let m;
    const container = document.createElement('span');
    container.style.display = 'inline';
    while ((m = phoneRegex.exec(text))) {
        const start = m.index;
        const end = start + m[0].length;
        // Digit normalization & length guard
        const digitStr = m[0].replace(/[^\d]/g, '')
        const digitCount = digitStr.length
        if (digitCount < MIN_PHONE_DIGITS || digitCount > MAX_PHONE_DIGITS) {
            continue
        }
        if (start > last) container.appendChild(document.createTextNode(text.slice(last, start)));
        const wrap = document.createElement('span');
        wrap.style.position = 'relative';
        wrap.style.display = 'inline-block';
        wrap.appendChild(document.createTextNode(m[0]));
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('icon.png');
        icon.dataset.wa = m[0].replace(/[^\d+]/g, '');
        icon.className = 'wa-icon';
        icon.style.position = 'absolute';
        icon.style.top = '50%';
        icon.style.right = '-20px';
        icon.style.transform = 'translateY(-50%)';
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.opacity = '0.7';
        icon.style.cursor = 'pointer';
        icon.style.transition = 'opacity 0.2s';
        icon.style.zIndex = '9999';
        wrap.appendChild(icon);
        container.appendChild(wrap);
        last = end;
    }
    if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
    if (textNode.parentNode) textNode.parentNode.replaceChild(container, textNode);
}

function injectIconStyles() {
    if (document.getElementById('__wa_icon_style__')) return
    const style = document.createElement('style')
    style.id = '__wa_icon_style__'
    style.textContent = `.wa-icon:hover{opacity:1!important}`
    document.head.appendChild(style)
}

function scanOnce() {
    const nodes = getSafeTextNodes(document.body);
    for (const tn of nodes) {
        if (tn.__wa_processed) continue; // already handled
        const val = tn.nodeValue;
        if (!val || val.length < 7) continue;
        phoneRegex.lastIndex = 0; // reset before test because of global flag
        if (!/[0-9]/.test(val)) continue; // must contain digits
        if (phoneRegex.test(val)) wrapNodeWithIcons(tn);
    }
}

function debounce(fn, wait) {
    let t
    return function() {
        clearTimeout(t)
        t = setTimeout(() => fn(), wait)
    }
}

function enableLiveScan() {
    const run = () => scanOnce()
    const runDebounced = debounce(run, 200)
    const mo = new MutationObserver((muts) => {
        for (const m of muts) {
            if (m.type === 'childList' || m.type === 'characterData') {
                runDebounced()
                break
            }
        }
    })
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true })
    run()
}

function setupClickHandler(countryCode) {
    if (document.getElementById('__wa_icon_click_bound__')) return
    const flag = document.createElement('div')
    flag.id = '__wa_icon_click_bound__'
    flag.style.display = 'none'
    document.documentElement.appendChild(flag)
    document.addEventListener('click', (e) => {
        const t = e.target
        if (!(t && t.classList && t.classList.contains('wa-icon'))) return
        const raw = t.dataset.wa || ''
        const parsed = parsePhoneNumber(raw, countryCode)
        const url = `https://wa.me/${parsed}`
        window.open(url, '_blank')
    }, true)
}

chrome.storage.local.get(['injectIcons','country'], (settings) => {
    if (settings && settings.injectIcons === false) return
    const countryCode = getFallbackCode(settings && settings.country)
    injectIconStyles()
    enableLiveScan()
    setupClickHandler(countryCode)
})
