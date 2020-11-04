function validateUrl(value) {
    return /^(?:(https:\/\/vision.davivienda.com)|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function shareOntwitter() {
    const origin = window.location;
    if (!validateUrl(origin)) {
        return false;
    }
    var url = 'https://twitter.com/intent/tweet?url=' + origin + '&via=vision&text=Check%20this%20out';
    var w = 600;
    var h = 300;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    window.open(url, '_blank', 'menubar=no,toolbar=no,resizable=none,scrollbars=no,height=' + h + ',width=' + w + ',top=' + top + ',left=' + left);
    return false;
}

function shareOnLinkedin() {
    const origin = window.location.href;
    if (!validateUrl(origin)) {
        return false;
    }
    var w = 600;
    var h = 300;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    var url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + origin + '&title=LinkedIn%20Developer%20Network&summary=My%20favorite%20developer%20program&source=LinkedIn';
    window.open(url, '_blank', 'menubar=no,toolbar=no,resizable=none,scrollbars=no,height=' + h + ',width=' + w + ',top=' + top + ',left=' + left);
    return false;
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

$('.circle.twitter').click(() => {
    shareOntwitter();
});

$('.circle.linkedin').click(() => {
    shareOnLinkedin();
});

$('.circle.link').click(() => {
    const origin = window.location;
    if (!validateUrl(origin)) {
        return false;
    }
    copyToClipboard(origin);
});
