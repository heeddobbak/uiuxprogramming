const serviceName = "초이스 댄스 스튜디오";

let applicantName = "";
let isRegistered = false;
let submitCount = 0;

function makeRegisterMessage(name, className, registered) {
  if (registered === true) {
    return name + "님의 " + className + " 클래스 수강 신청이 완료되었습니다.";
  }

  return "이름을 입력하고 클래스를 선택한 뒤 수강 신청해주세요.";
}

// 수강 신청
const registerForm = document.querySelector("#register-form");
const nameInput = document.querySelector("#name");
const registerClass = document.querySelector("#registerClass");
const registerButton = document.querySelector("#registerButton");
const registerMessage = document.querySelector("#registerMessage");

function handleRegister(event) {
  event.preventDefault();

  const registeredName = nameInput.value.trim();
  const selectedClass = registerClass.value;

  if (registeredName === "") {
    registerMessage.textContent = "이름을 입력해주세요.";
    nameInput.focus();
    return;
  }

  if (selectedClass === "") {
    registerMessage.textContent = "신청할 클래스를 선택해주세요.";
    registerClass.focus();
    return;
  }

  applicantName = registeredName;
  isRegistered = true;
  submitCount += 1;

  registerMessage.textContent =
    makeRegisterMessage(applicantName, selectedClass, isRegistered);

  registerMessage.classList.add("is-success");

  registerButton.textContent = "신청 완료";
  registerButton.disabled = true;
}

registerForm.addEventListener("submit", handleRegister);

// 클래스 소개 탭 전환 (click 이벤트)
const classTabs = document.querySelectorAll(".tab");
const classPanels = document.querySelectorAll(".panel");

function handleClassTabClick(event) {
  const selectedTab = event.currentTarget;
  const targetId = selectedTab.dataset.target;

  classTabs.forEach(function (tab) {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-selected", "false");
  });

  classPanels.forEach(function (panel) {
    panel.classList.remove("is-active");
    panel.hidden = true;
  });

  selectedTab.classList.add("is-active");
  selectedTab.setAttribute("aria-selected", "true");

  const selectedPanel = document.querySelector(targetId);
  selectedPanel.classList.add("is-active");
  selectedPanel.hidden = false;
}

classTabs.forEach(function (tab) {
  tab.addEventListener("click", handleClassTabClick);
});

// 체험 수업 안내 보기 (click 이벤트)
const infoButton = document.querySelector("#infoButton");
const infoMessage = document.querySelector("#infoMessage");

function handleInfoClick() {
  if (infoMessage.hidden === true) {
    infoMessage.hidden = false;
    infoButton.textContent = "체험 수업 안내 닫기";
  } else {
    infoMessage.hidden = true;
    infoButton.textContent = "체험 수업 안내 보기";
  }
}

infoButton.addEventListener("click", handleInfoClick);

// 체험 수업 신청자 이름 (input 이벤트)
const trialName = document.querySelector("#trialName");
const trialNameCount = document.querySelector("#trialNameCount");

function handleTrialNameInput() {
  const maxLength = trialName.maxLength;
  const nameLength = Math.min(trialName.value.length, maxLength);

  trialNameCount.textContent = nameLength + " / " + maxLength + "자";
}

trialName.addEventListener("input", handleTrialNameInput);

// 체험 수업 안내사항 확인 (change 이벤트)
const trialAgree = document.querySelector("#trialAgree");
const trialAgreeMessage = document.querySelector("#trialAgreeMessage");
const trialStartButton = document.querySelector("#trialStartButton");

function handleTrialAgreeChange() {
  const agreed = trialAgree.checked;

  trialStartButton.disabled = !agreed;

  if (agreed === true) {
    trialAgreeMessage.textContent = "안내사항 확인이 완료되었습니다.";
    trialAgreeMessage.classList.add("is-ready");
  } else {
    trialAgreeMessage.textContent = "안내사항을 확인해주세요.";
    trialAgreeMessage.classList.remove("is-ready");
  }
}

trialAgree.addEventListener("change", handleTrialAgreeChange);