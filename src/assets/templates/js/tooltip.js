
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

$('#ponderarToggle').on('click', () => {
    $('#ponderarToggle').toggleClass('ponderar_down');
});
