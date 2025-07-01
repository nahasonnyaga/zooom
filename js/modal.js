function showModal(html) {
  document.getElementById('modal-content').innerHTML = html + '<button class="modal-close" onclick="closeModal()">&times;</button>';
  document.getElementById('modal').classList.add('show');
}
function closeModal() {
  document.getElementById('modal').classList.remove('show');
}
