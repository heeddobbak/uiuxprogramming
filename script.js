/* 7·8주차 수강 신청 및 내역 관리 프로토타입 */

// 신청 정보 저장
const formData = {
  name: "",
  phone: "",
  className: "",
  plan: "",
  mixClass: ""
};

// 화면 요소
const registerStart = document.querySelector("#registerStart");
const registerDialog = document.querySelector("#registerDialog");
const openRegisterDialog = document.querySelector("#openRegisterDialog");
const closeRegisterDialog = document.querySelector("#closeRegisterDialog");
const confirmRegisterStart = document.querySelector("#confirmRegisterStart");

const registerProgress = document.querySelector("#registerProgress");
const progressItems = registerProgress.querySelectorAll("li");
const registerForm = document.querySelector("#register-form");
const registerSteps = [
  document.querySelector("#registerStep1"),
  document.querySelector("#registerStep2"),
  document.querySelector("#registerStep3")
];

const registerComplete = document.querySelector("#registerComplete");
const registerMessage = document.querySelector("#registerMessage");

// 입력 요소
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const registerClass = document.querySelector("#registerClass");
const registerPlan = document.querySelector("#registerPlan");
const mixClassField = document.querySelector("#mixClassField");
const mixClass = document.querySelector("#mixClass");

// 오류 메시지
const nameError = document.querySelector("#nameError");
const phoneError = document.querySelector("#phoneError");
const classError = document.querySelector("#classError");

// 신청 내용 확인 요소
const summaryName = document.querySelector("#summaryName");
const summaryPhone = document.querySelector("#summaryPhone");
const summaryClass = document.querySelector("#summaryClass");
const summaryPlan = document.querySelector("#summaryPlan");

// 버튼
const toRegisterStep2 = document.querySelector("#toRegisterStep2");
const toRegisterStep3 = document.querySelector("#toRegisterStep3");
const backToRegisterStep1 = document.querySelector("#backToRegisterStep1");
const backToRegisterStep2 = document.querySelector("#backToRegisterStep2");
const restartRegister = document.querySelector("#restartRegister");

// 현재 단계 표시
let currentStep = null;

function showStep(index) {
  currentStep = index;
  registerStart.hidden = true;
  registerComplete.hidden = true;
  registerProgress.hidden = false;
  registerForm.hidden = false;

  registerSteps.forEach(function (step, stepIndex) {
    step.hidden = stepIndex !== index;
  });

  progressItems.forEach(function (item, itemIndex) {
    const isCurrent = itemIndex === index;

    item.classList.toggle("is-current", isCurrent);

    if (isCurrent) {
      item.setAttribute("aria-current", "step");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

// 오류 표시 및 해제
function setFieldError(input, messageElement, message) {
  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  messageElement.textContent = message;
}

function clearFieldError(input, messageElement) {
  input.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
  messageElement.textContent = "";
}

// 휴대전화 번호 형식 정리
function formatPhoneNumber(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return numbers.slice(0, 3) + "-" + numbers.slice(3);
  }

  return (
    numbers.slice(0, 3) + "-" +
    numbers.slice(3, 7) + "-" +
    numbers.slice(7)
  );
}

// 신청 안내 팝업
openRegisterDialog.addEventListener("click", function () {
  registerDialog.showModal();
});

closeRegisterDialog.addEventListener("click", function () {
  registerDialog.close();
});

confirmRegisterStart.addEventListener("click", function () {
  registerDialog.close();
  showStep(0);
  nameInput.focus();
});

// 휴대전화 번호 입력 시 자동 형식 적용
phoneInput.addEventListener("input", function () {
  phoneInput.value = formatPhoneNumber(phoneInput.value);
  clearFieldError(phoneInput, phoneError);
});

nameInput.addEventListener("input", function () {
  clearFieldError(nameInput, nameError);
});

// 1단계: 신청자 정보 검사
function validateApplicant() {
  const name = nameInput.value.trim();
  const phone = phoneInput.value;
  const phonePattern = /^010-\d{4}-\d{4}$/;

  clearFieldError(nameInput, nameError);
  clearFieldError(phoneInput, phoneError);

  let isValid = true;
  let firstInvalidInput = null;

  if (name === "") {
    setFieldError(nameInput, nameError, "이름을 입력해주세요.");
    isValid = false;
    firstInvalidInput = nameInput;
  }

  if (!phonePattern.test(phone)) {
    setFieldError(
      phoneInput,
      phoneError,
      "010으로 시작하는 올바른 휴대전화 번호를 입력해주세요."
    );
    isValid = false;

    if (firstInvalidInput === null) {
      firstInvalidInput = phoneInput;
    }
  }

  if (!isValid) {
    showStep(0);
    firstInvalidInput.focus();
    return false;
  }

  formData.name = name;
  formData.phone = phone;
  return true;
}

toRegisterStep2.addEventListener("click", function () {
  if (!validateApplicant()) return;
  showStep(1);
  registerClass.focus();
});

// Mix 4회 선택 시 추가 클래스 표시
registerPlan.addEventListener("change", function () {
  const isMix = registerPlan.value === "Mix 4회";
  mixClassField.hidden = !isMix;

  if (!isMix) {
    mixClass.value = "";
  }

  clearFieldError(registerPlan, classError);
  clearFieldError(mixClass, classError);
  if (registerClass.getAttribute("aria-invalid") === "true") {
    classError.textContent = "신청할 클래스를 선택해주세요.";
  }
});

registerClass.addEventListener("change", function () {
  clearFieldError(registerClass, classError);
});

mixClass.addEventListener("change", function () {
  clearFieldError(mixClass, classError);
});

// 2단계: 수강 조건 검사
function validateClassSelection() {
  const selectedClass = registerClass.value;
  const selectedPlan = registerPlan.value;
  const selectedMixClass = mixClass.value;

  clearFieldError(registerClass, classError);
  clearFieldError(registerPlan, classError);
  clearFieldError(mixClass, classError);

  if (selectedClass === "") {
    setFieldError(
      registerClass,
      classError,
      "신청할 클래스를 선택해주세요."
    );
    showStep(1);
    registerClass.focus();
    return false;
  }

  if (selectedPlan === "") {
    setFieldError(
      registerPlan,
      classError,
      "수강 유형을 선택해주세요."
    );
    showStep(1);
    registerPlan.focus();
    return false;
  }

  if (selectedPlan === "Mix 4회") {
    if (selectedMixClass === "") {
      setFieldError(
        mixClass,
        classError,
        "함께 수강할 두 번째 클래스를 선택해주세요."
      );
      showStep(1);
      mixClass.focus();
      return false;
    }

    if (selectedClass === selectedMixClass) {
      setFieldError(
        mixClass,
        classError,
        "Mix 4회는 서로 다른 두 클래스를 선택해야 합니다."
      );
      showStep(1);
      mixClass.focus();
      return false;
    }
  }

  formData.className = selectedClass;
  formData.plan = selectedPlan;
  formData.mixClass =
    selectedPlan === "Mix 4회" ? selectedMixClass : "";

  return true;
}

toRegisterStep3.addEventListener("click", function () {
  if (!validateApplicant() || !validateClassSelection()) return;

  summaryName.textContent = formData.name;
  summaryPhone.textContent = formData.phone;

  summaryClass.textContent = formData.mixClass
    ? formData.className + " + " + formData.mixClass
    : formData.className;

  summaryPlan.textContent = formData.plan;

  showStep(2);
});

// 이전 단계로 이동
backToRegisterStep1.addEventListener("click", function () {
  showStep(0);
});

backToRegisterStep2.addEventListener("click", function () {
  showStep(1);
});

// 신청 완료
registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (currentStep !== 2 || registerForm.hidden) return;
  if (!validateApplicant() || !validateClassSelection()) return;

  addRegistration();
  currentStep = null;
  registerForm.hidden = true;
  registerProgress.hidden = true;
  registerComplete.hidden = false;

  registerMessage.textContent =
    formData.name + "님의 수강 신청 절차가 완료되었습니다.";

  registerMessage.classList.add("is-success");
});

// 다시 신청
restartRegister.addEventListener("click", function () {
  registerForm.reset();

  formData.name = "";
  formData.phone = "";
  formData.className = "";
  formData.plan = "";
  formData.mixClass = "";

  clearFieldError(nameInput, nameError);
  clearFieldError(phoneInput, phoneError);
  clearFieldError(registerClass, classError);
  clearFieldError(registerPlan, classError);
  clearFieldError(mixClass, classError);

  mixClassField.hidden = true;
  summaryName.textContent = "";
  summaryPhone.textContent = "";
  summaryClass.textContent = "";
  summaryPlan.textContent = "";
  registerMessage.textContent = "";
  registerMessage.classList.remove("is-success");

  showStep(0);
  nameInput.focus();
});


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

// 8주차: 완료한 신청을 저장하고 다시 확인·취소하기
const HISTORY_KEY = "chois-dance-registrations-v1";
const historyList = document.querySelector("#historyList");
const historyEmpty = document.querySelector("#historyEmpty");
const historyNotice = document.querySelector("#historyNotice");
const historyDetail = document.querySelector("#historyDetail");
const historyDetailContent = document.querySelector("#historyDetailContent");
const cancelConfirm = document.querySelector("#cancelConfirm");
const cancelFeedback = document.querySelector("#cancelFeedback");
const requestCancellation = document.querySelector("#requestCancellation");
let selectedRegistrationId = null;
let detailOpener = null;
let storageAvailable = true;
let registrations = loadRegistrations();

function loadRegistrations() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw === null) return [];
    const records = JSON.parse(raw);
    const fields = ["id", "name", "phone", "className", "plan", "mixClass", "createdAt"];
    if (!Array.isArray(records) || !records.every(function (record) {
      return record && fields.every(function (key) { return typeof record[key] === "string"; }) &&
        record.id !== "" && !Number.isNaN(Date.parse(record.createdAt)) &&
        ["active", "cancelled"].includes(record.status);
    }) || new Set(records.map(function (record) { return record.id; })).size !== records.length) {
      throw new Error("Invalid history");
    }
    return records;
  } catch (error) {
    storageAvailable = false;
    historyNotice.textContent = "저장된 내역을 불러올 수 없습니다. 새 신청은 현재 화면에서만 유지됩니다. 브라우저 저장 설정을 확인한 뒤 새로고침해주세요.";
    return [];
  }
}

function saveRegistrations() {
  try {
    if (!storageAvailable) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(registrations));
  } catch (error) {
    storageAvailable = false;
    historyNotice.textContent = "브라우저에 내역을 저장하지 못했습니다. 변경 내용은 현재 화면에서만 유지됩니다. 저장 공간과 브라우저 설정을 확인해주세요.";
  }
}

function registrationClasses(record) {
  return record.mixClass ? record.className + " + " + record.mixClass : record.className;
}

function addRegistration() {
  registrations.unshift({
    ...formData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "active"
  });
  saveRegistrations();
  renderRegistrations();
}

function renderRegistrations() {
  historyList.replaceChildren();
  historyEmpty.hidden = registrations.length > 0;
  registrations.forEach(function (record) {
    const item = document.createElement("li");
    item.className = "history-card";
    const title = document.createElement("h3");
    title.textContent = registrationClasses(record);
    const plan = document.createElement("p");
    plan.textContent = record.plan;
    const date = document.createElement("p");
    date.textContent = "신청일: " + new Date(record.createdAt).toLocaleString("ko-KR");
    const status = document.createElement("span");
    status.className = "history-status" + (record.status === "cancelled" ? " is-cancelled" : "");
    status.textContent = record.status === "cancelled" ? "취소됨" : "신청 완료";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "상세 보기";
    button.setAttribute("aria-label", registrationClasses(record) + " 신청 상세 보기");
    button.addEventListener("click", function () {
      selectedRegistrationId = record.id;
      detailOpener = button;
      renderRegistrationDetail();
      historyDetail.showModal();
    });
    item.append(title, plan, date, status, button);
    historyList.append(item);
  });
}

function renderRegistrationDetail() {
  const record = registrations.find(function (item) { return item.id === selectedRegistrationId; });
  cancelConfirm.hidden = true;
  cancelFeedback.textContent = "";
  historyDetailContent.replaceChildren();
  requestCancellation.hidden = !record || record.status !== "active";
  if (!record) {
    cancelFeedback.textContent = "신청 내역을 찾을 수 없습니다. 목록으로 돌아가 다른 내역을 선택해주세요.";
    return;
  }
  const rows = [
    ["이름", record.name], ["휴대전화 번호", record.phone],
    ["신청 클래스", registrationClasses(record)], ["수강 유형", record.plan],
    ["신청일", new Date(record.createdAt).toLocaleString("ko-KR")],
    ["상태", record.status === "cancelled" ? "취소됨" : "신청 완료"]
  ];
  rows.forEach(function (row) {
    const label = document.createElement("dt");
    const value = document.createElement("dd");
    label.textContent = row[0];
    value.textContent = row[1];
    historyDetailContent.append(label, value);
  });
}

requestCancellation.addEventListener("click", function () {
  const record = registrations.find(function (item) { return item.id === selectedRegistrationId; });
  if (!record || record.status !== "active") { renderRegistrationDetail(); return; }
  cancelConfirm.hidden = false;
  requestCancellation.hidden = true;
  document.querySelector("#keepRegistration").focus();
});

document.querySelector("#keepRegistration").addEventListener("click", function () {
  cancelConfirm.hidden = true;
  requestCancellation.hidden = false;
  cancelFeedback.textContent = "신청을 유지했습니다.";
  requestCancellation.focus();
});

document.querySelector("#confirmCancellation").addEventListener("click", function () {
  const record = registrations.find(function (item) { return item.id === selectedRegistrationId; });
  if (cancelConfirm.hidden || !record || record.status !== "active") return;
  record.status = "cancelled";
  saveRegistrations();
  renderRegistrations();
  renderRegistrationDetail();
  cancelFeedback.textContent = "신청을 취소했습니다. 취소된 내역은 목록에서 다시 확인할 수 있습니다." +
    (storageAvailable ? "" : " 브라우저 저장이 불가능하여 취소 상태는 현재 화면에서만 유지됩니다.");
  document.querySelector("#closeHistoryDetail").focus();
});

document.querySelector("#closeHistoryDetail").addEventListener("click", function () {
  historyDetail.close();
});
historyDetail.addEventListener("close", function () {
  cancelConfirm.hidden = true;
  selectedRegistrationId = null;
  if (detailOpener && detailOpener.isConnected) detailOpener.focus();
  else document.querySelector("#historyTitle").focus();
});

document.querySelector("#historyStart").addEventListener("click", function () {
  if (registerForm.hidden) {
    if (!registerComplete.hidden) restartRegister.click();
    else openRegisterDialog.click();
  }
  document.querySelector("#subscribe").scrollIntoView({ block: "start" });
  if (!registerForm.hidden) {
    registerSteps[currentStep].querySelector("input, select, button").focus();
  }
});

renderRegistrations();
