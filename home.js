const currentYear = new Date().getFullYear();
document.getElementById("year").textContent = currentYear;
let btnSound = new Audio("/audios/button.wav")
function playBtnSound() {
  btnSound.play();
}