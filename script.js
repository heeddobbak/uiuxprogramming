const serviceName = "초이스 댄스 스튜디오";

let applicantName = "";
let isRegistered = false;
let submitCount = 0;

function makeRegisterMessage(name, registered) {
  if (registered == true) {
    return name + "님의 수강 신청이 완료되었습니다.";
  }

  return "이름을 입력한 뒤 수강 신청해주세요.";
}

const registerForm = document.querySelector("#register-form");
const nameInput = document.querySelector("#name");
const registerButton = document.querySelector("#registerButton");
const registerMessage = document.querySelector("#registerMessage");

function handleRegister(event) {
    event.preventDefault();
  
    const registeredName = nameInput.value.trim();
  
    if (registeredName === "") {
      registerMessage.textContent =
        "이름을 입력한 뒤 수강 신청해주세요.";
      nameInput.focus();
      return;
    }
  
    applicantName = registeredName;
    isRegistered = true;
    submitCount += 1;
  
    registerMessage.textContent =
      makeRegisterMessage(applicantName, isRegistered);
  
    registerMessage.classList.add("is-success");
  
    registerButton.textContent = "신청 완료";
    registerButton.disabled = true;
  }
  
  registerForm.addEventListener("submit", handleRegister);