/* 7·8·9·10·11·12주차 수강 신청 및 내역 관리 프로토타입 */

// 10주차: 주소에 맞는 메뉴 표시와 모바일 메뉴 상태 관리
const mainNav = document.querySelector("#mainNav");
const navLinks = mainNav.querySelectorAll("a");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = window.matchMedia("(max-width: 600px)");

function setMenuOpen(open) {
  const expanded = mobileMenu.matches && open;
  mainNav.hidden = mobileMenu.matches && !expanded;
  menuToggle.setAttribute("aria-expanded", String(expanded));
  menuToggle.textContent = expanded ? "메뉴 닫기" : "메뉴 열기";
}
function syncMenuLayout() {
  // 화면 폭이 바뀌면 모바일은 접고, PC에서는 항상 메뉴를 표시한다.
  // 숨겨지는 메뉴·버튼에 초점이 남지 않게 먼저 옮긴다.
  const focusInNav = mainNav.contains(document.activeElement);
  const focusOnToggle = document.activeElement === menuToggle;
  if (mobileMenu.matches && focusInNav) {
    menuToggle.hidden = false;
    menuToggle.focus();
  } else if (!mobileMenu.matches && focusOnToggle) {
    mainNav.hidden = false;
    navLinks[0].focus();
  }
  menuToggle.hidden = !mobileMenu.matches;
  setMenuOpen(false);
}
function updateCurrentNav() {
  let pageName = "홈";
  const hash = window.location.hash || "#about";
  navLinks.forEach(function (link) {
    const current = link.getAttribute("href") === hash;
    link.classList.toggle("is-current", current);
    if (current) {
      link.setAttribute("aria-current", "location");
      pageName = link.textContent.trim();
    }
    else link.removeAttribute("aria-current");
  });
  document.title = pageName + " | 초이스 댄스 스튜디오";
}
function focusDestination(hash) {
  const section = document.getElementById(hash.slice(1));
  if (!section) return;
  const heading = section.querySelector("h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
}
menuToggle.addEventListener("click", function () {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
function closeMenuOnEscape(event) {
  if (event.key === "Escape" && mobileMenu.matches && !mainNav.hidden) {
    setMenuOpen(false);
    menuToggle.focus();
  }
}
mainNav.addEventListener("keydown", closeMenuOnEscape);
menuToggle.addEventListener("keydown", closeMenuOnEscape);
navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    setMenuOpen(false);
    // 기본 앵커 이동이 끝난 뒤 초점을 이동해 숨겨진 링크에 초점이 남지 않게 한다.
    requestAnimationFrame(function () {
      // 사용자가 이미 다음 컨트롤로 이동했다면 그 초점을 빼앗지 않는다.
      if (document.activeElement === link || document.activeElement === document.body) {
        focusDestination(link.getAttribute("href"));
      }
    });
  });
});
window.addEventListener("hashchange", updateCurrentNav);
window.addEventListener("pageshow", function () { syncMenuLayout(); updateCurrentNav(); });
mobileMenu.addEventListener("change", syncMenuLayout);
syncMenuLayout();
updateCurrentNav();

// 12주차: 루트 요소와 설정만 바꿔 재사용하는 UI 컴포넌트
function initializeTabs(root) {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  const tabList = root.querySelector('[role="tablist"]');
  const verticalQuery = root.dataset.verticalQuery ? window.matchMedia(root.dataset.verticalQuery) : null;
  function activate(tab, focus = false) {
    if (!tabs.includes(tab)) return;
    tabs.forEach(function (item) {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      const selected = panel.id === tab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", selected);
      panel.hidden = !selected;
      panel.tabIndex = selected ? 0 : -1;
    });
    if (focus) tab.focus();
  }
  function syncOrientation() {
    tabList.setAttribute("aria-orientation", verticalQuery && verticalQuery.matches ? "vertical" : "horizontal");
  }
  if (verticalQuery) verticalQuery.addEventListener("change", syncOrientation);
  syncOrientation();
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activate(tab); });
    tab.addEventListener("keydown", function (event) {
      const vertical = tabList.getAttribute("aria-orientation") === "vertical";
      let next = index;
      if (event.key === (vertical ? "ArrowUp" : "ArrowLeft")) next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) next = (index + 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  });
  if (tabs.length) activate(tabs.find(function (tab) { return tab.getAttribute("aria-selected") === "true"; }) || tabs[0]);
  return { activate: activate };
}

function createModal(dialog, options = {}) {
  let opener = null;
  let restoreFocus = true;
  function open(trigger = document.activeElement) {
    if (dialog.open) return;
    opener = trigger;
    restoreFocus = true;
    dialog.showModal();
    const initial = dialog.querySelector('[data-modal-initial-focus]');
    if (initial) initial.focus();
  }
  function close(settings = {}) {
    if (!dialog.open) return;
    restoreFocus = settings.restoreFocus !== false;
    dialog.close();
  }
  dialog.querySelectorAll('[data-modal-close]').forEach(function (button) {
    button.addEventListener("click", function () { close(); });
  });
  // 표시 중인 컨트롤을 매번 읽어 취소 확인 영역의 열림·닫힘도 반영한다.
  dialog.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    const controls = Array.from(dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')).filter(function (element) {
      return !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0;
    });
    if (!controls.length) {
      event.preventDefault();
      dialog.setAttribute("tabindex", "-1");
      dialog.focus();
      return;
    }
    const first = controls[0];
    const last = controls[controls.length - 1];
    const active = document.activeElement;
    if (!controls.includes(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
  // Escape로 닫기는 브라우저의 기본 dialog 동작을 사용한다.
  dialog.addEventListener("close", function () {
    if (restoreFocus) {
      const target = opener && opener.isConnected && !opener.disabled ? opener :
        (options.getReturnFocus ? options.getReturnFocus() : null);
      if (target) target.focus();
    }
    opener = null;
  });
  return { open: open, close: close };
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

// 신청 정보 저장
const formData = {
  name: "",
  phone: "",
  className: "",
  plan: "",
  mixClass: "",
  days: "",
  mixDays: ""
};

// 화면 요소
const registerStart = document.querySelector("#registerStart");
const registerDialog = document.querySelector("#registerDialog");
const openRegisterDialog = document.querySelector("#openRegisterDialog");
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
const classDays = document.querySelector("#classDays");
const mixDays = document.querySelector("#mixDays");
const classDaysError = document.querySelector("#classDaysError");
const mixDaysError = document.querySelector("#mixDaysError");
const classSchedule = document.querySelector("#classSchedule");
const mixScheduleStatus = document.querySelector("#mixScheduleStatus");
const mixAlternatives = document.querySelector("#mixAlternatives");
const mixAlternativeList = document.querySelector("#mixAlternativeList");
// 시작 시간과 수업 길이는 분 단위이며 모든 수강 요일에서 같다.
const classTimetable = {
  "Dance-eter": { start: 600, duration: 50 },
  "Easy Shuffle": { start: 660, duration: 50 },
  "Kids K-POP (오후 4시)": { start: 960, duration: 40 },
  "Kids K-POP (오후 5시)": { start: 1020, duration: 50 },
  "K-POP Dance (오후 7시)": { start: 1140, duration: 50 },
  "K-POP Dance (오후 8시)": { start: 1200, duration: 50 }
};

// 오류 메시지
const nameHelp = document.querySelector("#nameHelp");
const phoneHelp = document.querySelector("#phoneHelp");
const nameError = document.querySelector("#nameError");
const phoneError = document.querySelector("#phoneError");
const classError = document.querySelector("#classError");
const planError = document.querySelector("#planError");
const mixError = document.querySelector("#mixError");
const submitStatus = document.querySelector("#submitStatus");
const registerButton = document.querySelector("#registerButton");
let isSubmitting = false;

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
  const heading = registerSteps[index].querySelector("h3");
  heading.setAttribute("tabindex", "-1");
  heading.focus();
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

// 같은 모달 컴포넌트를 신청 안내와 내역 상세에서 사용한다.
const registrationModal = createModal(registerDialog);
openRegisterDialog.addEventListener("click", function (event) {
  registrationModal.open(event.currentTarget);
});

confirmRegisterStart.addEventListener("click", function () {
  registrationModal.close({ restoreFocus: false });
  showStep(0);
  nameInput.focus();
});

// 잘못 입력한 항목에만 오류를 표시하고, 조건 충족 시 해제한다.
function updateApplicantFeedback(changedInput = null) {
  const length = nameInput.value.trim().length;
  const nameValid = length >= 2 && length <= 30;
  const phoneValid = /^010-\d{4}-\d{4}$/.test(phoneInput.value);
  nameHelp.textContent = nameValid ? "이름 입력 조건을 충족했습니다." : "이름은 2자 이상 입력해주세요.";
  phoneHelp.textContent = phoneValid ? "전화번호 입력 조건을 충족했습니다." : "010부터 입력해주세요.";
  [[nameInput, nameError, nameValid, "이름을 2~30자로 입력해주세요."],
   [phoneInput, phoneError, phoneValid, "010으로 시작하는 휴대전화 번호 11자리를 입력해주세요."]].forEach(function (field) {
    if (field[2]) clearFieldError(field[0], field[1]);
    else if (field[0] === changedInput) setFieldError(field[0], field[1], field[3]);
  });
}
phoneInput.addEventListener("input", function () {
  phoneInput.value = formatPhoneNumber(phoneInput.value);
  updateApplicantFeedback(phoneInput);
});
nameInput.addEventListener("input", function (event) {
  if (!event.isComposing) updateApplicantFeedback(nameInput);
});
nameInput.addEventListener("compositionend", function () { updateApplicantFeedback(nameInput); });

// 1단계: 신청자 정보 검사
function validateApplicant() {
  const name = nameInput.value.trim();
  const phone = phoneInput.value;
  const phonePattern = /^010-\d{4}-\d{4}$/;

  clearFieldError(nameInput, nameError);
  clearFieldError(phoneInput, phoneError);

  let isValid = true;
  let firstInvalidInput = null;

  if (name.length < 2 || name.length > 30) {
    setFieldError(nameInput, nameError, "이름을 2~30자로 입력해주세요.");
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
  registerPlan.focus();
});

// 11주차: 요일이 겹치고 시간 구간이 겹치는 경우만 충돌한다.
function timeLabel(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}
function scheduleLabel(className, days) {
  const slot = classTimetable[className];
  if (!slot) return "";
  return (days ? days + " " : "") + timeLabel(slot.start) + "~" + timeLabel(slot.start + slot.duration);
}
function schedulesOverlap(firstClass, firstDays, secondClass, secondDays) {
  const first = classTimetable[firstClass];
  const second = classTimetable[secondClass];
  if (!first || !second || !firstDays || !secondDays) return false;
  const commonDay = firstDays.split("·").some(function (day) { return secondDays.split("·").includes(day); });
  return commonDay && first.start < second.start + second.duration && second.start < first.start + first.duration;
}
function updateScheduleFeedback() {
  const isMix = registerPlan.value === "Mix 4회";
  classSchedule.hidden = !isMix;
  classSchedule.textContent = !isMix ? "" : registerClass.value ? "첫 번째 수업: " + scheduleLabel(registerClass.value, classDays.value) : "클래스를 선택하면 수업 시간을 안내합니다.";
  mixAlternativeList.replaceChildren();
  mixAlternatives.hidden = true;
  mixScheduleStatus.textContent = "";
  if (!isMix) return;
  const same = registerClass.value && mixClass.value === registerClass.value;
  const overlap = schedulesOverlap(registerClass.value, classDays.value, mixClass.value, mixDays.value);
  if (same || overlap) {
    mixScheduleStatus.textContent = overlap ? "시간 겹침: " + scheduleLabel(registerClass.value, classDays.value) + " / " + scheduleLabel(mixClass.value, mixDays.value) + (same ? ". 같은 클래스는 두 번 선택할 수 없습니다. 다른 클래스를 선택해주세요." : ". 다른 클래스 또는 요일을 선택해주세요.") : "같은 클래스는 두 번 선택할 수 없습니다. 아래에서 다른 클래스를 선택해주세요.";
    mixAlternatives.hidden = false;
    Object.keys(classTimetable).forEach(function (name) {
      ["화·목", "수·금"].forEach(function (days) {
        if (name === registerClass.value || schedulesOverlap(registerClass.value, classDays.value, name, days)) return;
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        const title = document.createElement("span");
        title.className = "mix-card-title";
        // 시간은 둘째 줄에 표시하므로 클래스명의 시간 괄호는 중복하지 않는다.
        title.textContent = name.replace(/ \(오후 \d+시\)$/, "") + ", " + days;
        const time = document.createElement("span");
        time.className = "mix-card-time";
        time.textContent = scheduleLabel(name, "");
        button.setAttribute("aria-label", name + ", " + days + ", " + time.textContent);
        button.append(title, time);
        button.addEventListener("click", function () {
          mixClass.value = name;
          mixDays.value = days;
          updateScheduleFeedback();
          checkClassFields();
          mixClass.focus();
        });
        li.append(button);
        mixAlternativeList.append(li);
      });
    });
  } else if (registerClass.value && classDays.value && mixClass.value && mixDays.value) {
    mixScheduleStatus.textContent = "시간 겹침 없음: " + scheduleLabel(registerClass.value, classDays.value) + " / " + scheduleLabel(mixClass.value, mixDays.value) + ". 함께 수강할 수 있습니다.";
  } else {
    mixScheduleStatus.textContent = "두 클래스와 각각의 수강 요일을 선택하면 시간 겹침을 확인합니다.";
  }
}

// Mix 선택에 따라 표시·활성화·필수 여부를 함께 변경한다.
function syncMixField() {
  const isMix = registerPlan.value === "Mix 4회";
  mixClassField.hidden = !isMix;
  mixClass.disabled = !isMix;
  mixClass.required = isMix;
  mixDays.disabled = !isMix;
  mixDays.required = isMix;
  if (!isMix) {
    mixClass.value = "";
    mixDays.value = "";
    clearFieldError(mixClass, mixError);
    clearFieldError(mixDays, mixDaysError);
  }
  const fourDays = registerPlan.value === "주 4회 (월 16회)";
  const fourDayOption = classDays.querySelector('option[value="화·수·목·금"]');
  fourDayOption.disabled = !fourDays;
  fourDayOption.hidden = !fourDays;
  classDays.disabled = fourDays;
  classDays.required = !fourDays;
  if (fourDays) classDays.value = "화·수·목·금";
  else if (classDays.value === "화·수·목·금") classDays.value = "";
  updateScheduleFeedback();
}
function checkClassFields(showAllErrors = false) {
  const isMix = registerPlan.value === "Mix 4회";
  const fields = [
    [registerPlan, planError, registerPlan.value ? "" : "수강 유형을 선택해주세요."],
    [registerClass, classError, registerClass.value ? "" : "신청할 클래스를 선택해주세요."],
    [classDays, classDaysError, (registerPlan.value === "주 4회 (월 16회)" ? classDays.value === "화·수·목·금" : ["화·목", "수·금"].includes(classDays.value)) ? "" : "첫 번째 클래스의 수강 요일을 선택해주세요."],
    [mixClass, mixError, !isMix ? "" : !mixClass.value ? "함께 수강할 두 번째 클래스를 선택해주세요." :
      mixClass.value === registerClass.value ? "Mix 4회는 서로 다른 두 클래스를 선택해주세요." :
      schedulesOverlap(registerClass.value, classDays.value, mixClass.value, mixDays.value) ? "두 수업의 요일과 시간이 겹칩니다. 아래 변경 가능한 수업을 선택해주세요." : ""],
    [mixDays, mixDaysError, !isMix || ["화·목", "수·금"].includes(mixDays.value) ? "" : "두 번째 클래스의 수강 요일을 선택해주세요."]
  ];
  fields.forEach(function (field) {
    if (!field[2]) clearFieldError(field[0], field[1]);
    else if (showAllErrors || field[0].value || field[0].getAttribute("aria-invalid") === "true") {
      setFieldError(field[0], field[1], field[2]);
    }
  });
  return fields.find(function (field) { return field[2]; });
}
registerPlan.addEventListener("change", function () { syncMixField(); checkClassFields(); });
registerClass.addEventListener("change", function () { updateScheduleFeedback(); checkClassFields(); });
mixClass.addEventListener("change", function () { updateScheduleFeedback(); checkClassFields(); });
classDays.addEventListener("change", function () { updateScheduleFeedback(); checkClassFields(); });
mixDays.addEventListener("change", function () { updateScheduleFeedback(); checkClassFields(); });

function validateClassSelection() {
  const invalid = checkClassFields(true);
  if (invalid) {
    showStep(1);
    invalid[0].focus();
    return false;
  }
  formData.className = registerClass.value;
  formData.plan = registerPlan.value;
  formData.mixClass = mixClass.disabled ? "" : mixClass.value;
  formData.days = classDays.value;
  formData.mixDays = mixDays.disabled ? "" : mixDays.value;
  return true;
}

toRegisterStep3.addEventListener("click", function () {
  if (!validateApplicant() || !validateClassSelection()) return;

  summaryName.textContent = formData.name;
  summaryPhone.textContent = formData.phone;

  summaryClass.textContent = registrationClasses(formData);

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

// 9주차: 제출 잠금 → 저장 성공·실패 → 재시도. 실패 시 입력과 확인 화면을 유지한다.
registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (isSubmitting || registerForm.hidden) return;
  if (currentStep !== 2) {
    if (currentStep === 0) toRegisterStep2.click();
    else if (currentStep === 1) toRegisterStep3.click();
    return;
  }
  if (!validateApplicant() || !validateClassSelection()) return;
  isSubmitting = true;
  registerForm.setAttribute("aria-busy", "true");
  registerButton.disabled = true;
  backToRegisterStep2.disabled = true;
  registerButton.textContent = "저장 중…";
  submitStatus.classList.remove("is-error");
  submitStatus.textContent = "신청 내용을 브라우저에 저장하고 있습니다.";
  try {
    // 서버 없는 프로토타입에서 처리 중 상태를 확인하기 위한 짧은 대기
    await new Promise(function (resolve) { setTimeout(resolve, 600); });
    addRegistration();
    currentStep = null;
    registerForm.hidden = true;
    registerProgress.hidden = true;
    registerComplete.hidden = false;
    registerMessage.textContent = formData.name + "님의 신청 내역이 이 브라우저에 저장되었습니다.";
    registerMessage.classList.add("is-success");
    registerMessage.focus();
  } catch (error) {
    submitStatus.classList.add("is-error");
    submitStatus.textContent = "저장하지 못했습니다. 입력 내용은 유지됩니다. 브라우저 저장 설정과 여유 공간을 확인한 뒤 ‘다시 시도하기’를 눌러주세요.";
    submitStatus.focus();
  } finally {
    isSubmitting = false;
    registerForm.removeAttribute("aria-busy");
    registerButton.disabled = false;
    backToRegisterStep2.disabled = false;
    registerButton.textContent = registerForm.hidden ? "신청 완료하기" : "다시 시도하기";
  }
});

// 다시 신청
restartRegister.addEventListener("click", function () {
  registerForm.reset();

  formData.name = "";
  formData.phone = "";
  formData.className = "";
  formData.plan = "";
  formData.mixClass = "";
  formData.days = "";
  formData.mixDays = "";

  clearFieldError(nameInput, nameError);
  clearFieldError(phoneInput, phoneError);
  clearFieldError(registerClass, classError);
  clearFieldError(registerPlan, planError);
  clearFieldError(mixClass, mixError);

  mixClassField.hidden = true;
  mixClass.disabled = true;
  mixClass.required = false;
  clearFieldError(classDays, classDaysError);
  clearFieldError(mixDays, mixDaysError);
  syncMixField();
  summaryName.textContent = "";
  summaryPhone.textContent = "";
  summaryClass.textContent = "";
  summaryPlan.textContent = "";
  registerMessage.textContent = "";
  registerMessage.classList.remove("is-success");

  submitStatus.textContent = "";
  submitStatus.classList.remove("is-error");
  registerButton.textContent = "신청 완료하기";
  registerButton.disabled = false;
  backToRegisterStep2.disabled = false;
  registerForm.removeAttribute("aria-busy");
  updateApplicantFeedback();
  showStep(0);
  nameInput.focus();
});


// 각 루트 안에서만 상태를 관리하므로 여러 탭 묶음이 서로 간섭하지 않는다.
const tabComponents = Array.from(document.querySelectorAll('[data-ui-tabs]')).map(initializeTabs);

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
let storageAvailable = true;
let registrations = loadRegistrations();
const historyFilters = document.querySelectorAll(".history-filter");
const historyResults = document.querySelector("#historyResults");
const historyEmptyTitle = document.querySelector("#historyEmptyTitle");
const historyEmptyDescription = document.querySelector("#historyEmptyDescription");
const historyShowAll = document.querySelector("#historyShowAll");
const historyStart = document.querySelector("#historyStart");
let currentHistoryFilter = "all";
const filterLabels = { all: "전체", active: "신청 완료", cancelled: "취소됨" };
const historyModal = createModal(historyDetail, {
  getReturnFocus: function () {
    // 목록이 다시 그려졌다면 같은 내역의 새 버튼을 찾고, 없으면 선택 필터로 돌아간다.
    return Array.from(historyList.querySelectorAll('[data-registration-id]')).find(function (button) {
      return button.dataset.registrationId === selectedRegistrationId;
    }) || Array.from(historyFilters).find(function (button) {
      return button.getAttribute("aria-pressed") === "true";
    }) || document.querySelector("#historyTitle");
  }
});

function selectHistoryFilter(filter) {
  currentHistoryFilter = filter;
  historyFilters.forEach(function (button) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderRegistrations();
}
historyFilters.forEach(function (button) {
  button.addEventListener("click", function () { selectHistoryFilter(button.dataset.filter); });
});
historyShowAll.addEventListener("click", function () {
  selectHistoryFilter("all");
  historyFilters[0].focus();
});

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
    historyNotice.textContent = "저장된 내역을 불러올 수 없습니다. 기존 데이터를 보호하기 위해 새 신청 저장을 중단합니다. 브라우저 저장 설정을 확인한 뒤 다시 시도해주세요.";
    return [];
  }
}

// 취소도 최신 저장 목록을 기준으로 처리하고, 저장 성공 후에만 화면에 반영한다.
function cancelRegistration(id) {
  storageAvailable = true;
  const saved = loadRegistrations();
  if (!storageAvailable) throw new Error("History unavailable");
  const record = saved.find(function (item) { return item.id === id; });
  if (!record) throw new Error("Registration not found");
  if (record.status !== "cancelled") {
    const next = saved.map(function (item) {
      return item.id === id ? { ...item, status: "cancelled" } : item;
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    registrations = next;
  } else {
    // 다른 탭에서 이미 취소했다면 최신 상태만 반영한다.
    registrations = saved;
  }
  historyNotice.textContent = "";
}

function registrationClasses(record) {
  const first = record.className + (record.days ? " · " + scheduleLabel(record.className, record.days) : "");
  return record.mixClass ? first + " + " + record.mixClass + (record.mixDays ? " · " + scheduleLabel(record.mixClass, record.mixDays) : "") : first;
}

function addRegistration() {
  // 매번 읽기를 재시도한다. 읽기 실패·손상 데이터가 있으면 덮어쓰지 않는다.
  storageAvailable = true;
  const saved = loadRegistrations();
  if (!storageAvailable) throw new Error("History unavailable");
  const record = {
    ...formData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "active"
  };
  const next = [record, ...saved];
  // 쓰기가 성공한 뒤에만 메모리와 목록을 갱신해 실패·재시도 중복을 방지한다.
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  registrations = next;
  historyNotice.textContent = "";
  renderRegistrations();
}

function renderRegistrations() {
  historyList.replaceChildren();
  const visible = registrations.filter(function (record) {
    return currentHistoryFilter === "all" || record.status === currentHistoryFilter;
  });
  historyResults.textContent = filterLabels[currentHistoryFilter] + " " + visible.length + "건";
  historyList.hidden = visible.length === 0;
  historyEmpty.hidden = visible.length > 0;
  const noHistory = registrations.length === 0;
  historyEmptyTitle.textContent = noHistory ? "아직 신청 내역이 없습니다." :
    (currentHistoryFilter === "cancelled" ? "취소된 신청 내역이 없습니다." : "신청 완료된 내역이 없습니다.");
  historyEmptyDescription.textContent = noHistory ? "원하는 클래스에 신청하면 이곳에서 내역을 확인하고 취소할 수 있습니다." :
    "다른 상태를 선택하거나 전체 내역을 확인해주세요.";
  historyStart.hidden = !noHistory;
  historyShowAll.hidden = noHistory || visible.length > 0;
  visible.forEach(function (record) { historyList.append(createRegistrationCard(record)); });
}

// 공통 구조는 한 번만 정의하고 클래스·요일·상태는 데이터로 채운다.
function createRegistrationCard(record) {
  const item = document.createElement("li");
  item.className = "history-card ui-card";
  const title = createTextElement("h3", "ui-card__title", registrationClasses(record));
  const plan = createTextElement("p", "ui-card__plan", record.plan);
  const date = createTextElement("p", "ui-card__date", "신청일: " + new Date(record.createdAt).toLocaleString("ko-KR"));
  const status = createTextElement("span", "history-status" + (record.status === "cancelled" ? " is-cancelled" : ""), record.status === "cancelled" ? "취소됨" : "신청 완료");
  const button = createTextElement("button", "ui-card__detail", "상세 보기");
  button.type = "button";
  button.dataset.registrationId = record.id;
  button.setAttribute("aria-label", registrationClasses(record) + " 신청 상세 보기");
  button.addEventListener("click", function () {
    selectedRegistrationId = record.id;
    renderRegistrationDetail();
    historyModal.open(button);
  });
  item.append(title, plan, date, status, button);
  return item;
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
  try {
    cancelRegistration(selectedRegistrationId);
    renderRegistrations();
    renderRegistrationDetail();
    cancelFeedback.textContent = "신청을 취소했습니다. 취소된 내역은 목록에서 다시 확인할 수 있습니다.";
    document.querySelector("#closeHistoryDetail").focus();
  } catch (error) {
    // 기존 상태와 취소 확인 화면을 유지해 같은 버튼으로 다시 시도할 수 있다.
    cancelFeedback.textContent = "취소를 저장하지 못했습니다. 신청 상태는 변경하지 않았습니다. 브라우저 저장 설정과 신청 내역을 확인한 뒤 ‘신청 취소하기’를 다시 눌러주세요.";
    document.querySelector("#confirmCancellation").focus();
  }
});

historyDetail.addEventListener("close", function () {
  cancelConfirm.hidden = true;
  selectedRegistrationId = null;
});

document.querySelector("#historyStart").addEventListener("click", function () {
  if (registerForm.hidden) {
    if (!registerComplete.hidden) restartRegister.click();
    else openRegisterDialog.click();
  }
  window.location.hash = "subscribe";
  updateCurrentNav();
  document.querySelector("#subscribe").scrollIntoView({ block: "start" });
  if (!registerForm.hidden) {
    registerSteps[currentStep].querySelector("input, select, button").focus();
  }
});

renderRegistrations();
