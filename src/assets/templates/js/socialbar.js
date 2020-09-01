function shareOntwitter() {
  var url = 'https://twitter.com/intent/tweet?url=' + window.location + '&via=vision&text=Check%20this%20out';
  var w = 600;
  var h = 300;
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  window.open(url, '_blank', 'menubar=no,toolbar=no,resizable=none,scrollbars=no,height=' + h + ',width=' + w + ',top=' + top + ',left=' + left);
  return false;
}

function shareOnLinkedin() {
  var w = 600;
  var h = 300;
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  var url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + window.location.href + '&title=LinkedIn%20Developer%20Network&summary=My%20favorite%20developer%20program&source=LinkedIn';
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
  copyToClipboard(window.location);
});
