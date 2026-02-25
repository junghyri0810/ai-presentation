/* ===================================================
   전역 상태
=================================================== */
let isVerified = false; // 본인인증 완료 여부

/* ===================================================
   카드 전환
=================================================== */
function showCard(cardId) {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hidden');
    });
    const target = document.getElementById(cardId);
    target.classList.remove('hidden');
    target.style.animation = 'none';
    target.offsetHeight;
    target.style.animation = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===================================================
   토스트 알림
=================================================== */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

/* ===================================================
   팝업 모달
=================================================== */
function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
});

/* ===================================================
   비밀번호 표시/숨기기 토글
=================================================== */
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

/* ===================================================
   Inline 에러 처리
=================================================== */
function setError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function clearError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
}

function clearAllErrors(...ids) {
    ids.forEach(id => clearError(id));
}

/* ===================================================
   아이디 유효성 검사
=================================================== */
function validateId(id) {
    if (!id) return '아이디를 입력해주세요.';
    if (/\s/.test(id)) return '아이디에 공백을 사용할 수 없습니다.';
    if (!/^[a-z0-9]+$/.test(id)) return '아이디는 영문(소문자)과 숫자만 사용 가능합니다.';
    if (id.length < 8 || id.length > 30) return '아이디는 8자 이상 30자 이하로 입력해주세요.';
    return '';
}

/* ===================================================
   비밀번호 유효성 검사
=================================================== */
function validatePasswordLogin(pw) {
    if (!pw) return '비밀번호를 입력해주세요.';
    if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    return '';
}

function validatePasswordSignup(pw) {
    if (!pw) return '비밀번호를 입력해주세요.';
    if (pw.length < 8 || pw.length > 12) return '비밀번호는 8~12자 이내로 입력해주세요.';
    if (!/[a-zA-Z]/.test(pw)) return '영문을 포함해야 합니다.';
    if (!/[0-9]/.test(pw)) return '숫자를 포함해야 합니다.';
    if (!/[^a-zA-Z0-9]/.test(pw)) return '특수문자를 포함해야 합니다.';
    return '';
}

/* ===================================================
   비밀번호 강도 표시 (회원가입)
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const signupPw = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('passwordStrength');

    if (signupPw && strengthBar) {
        signupPw.addEventListener('input', () => {
            const val = signupPw.value;
            strengthBar.className = 'password-strength';
            if (!val) return;

            let score = 0;
            if (val.length >= 8 && val.length <= 12) score++;
            if (/[a-zA-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^a-zA-Z0-9]/.test(val)) score++;

            if (score <= 1) strengthBar.classList.add('weak');
            else if (score <= 2) strengthBar.classList.add('medium');
            else if (score <= 3) strengthBar.classList.add('medium');
            else strengthBar.classList.add('strong');
        });
    }
});

/* ===================================================
   로그인 처리
=================================================== */
function handleLogin(event) {
    event.preventDefault();

    const idInput = document.getElementById('loginId');
    const id = idInput.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    // 대문자 → 소문자 자동 변환
    idInput.value = id;

    // 인라인 에러 초기화
    clearAllErrors('loginIdError', 'loginPasswordError');

    // 필수값 누락 체크
    const idErr = validateId(id);
    const pwErr = validatePasswordLogin(password);

    let hasError = false;
    if (idErr) { setError('loginIdError', idErr); hasError = true; }
    if (pwErr) { setError('loginPasswordError', pwErr); hasError = true; }
    if (hasError) return false;

    // 로딩 상태
    const btn = event.target.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = originalText;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === id && u.password === password);

        if (user) {
            // 아이디 저장 처리
            if (document.getElementById('saveId').checked) {
                localStorage.setItem('savedId', id);
            } else {
                localStorage.removeItem('savedId');
            }

            // 자동 로그인 처리
            if (document.getElementById('autoLogin').checked) {
                localStorage.setItem('autoLoginId', id);
                localStorage.setItem('autoLoginPw', password);
            } else {
                localStorage.removeItem('autoLoginId');
                localStorage.removeItem('autoLoginPw');
            }

            showToast(`${user.name}님, 환영합니다!`, 'success');
        } else {
            // 아이디/비밀번호 불일치 → 팝업 모달
            showModal('아이디가 존재하지 않습니다.\n비밀번호를 확인해주세요.');
        }
    }, 1200);

    return false;
}

/* ===================================================
   회원가입 Step 1: 약관동의
=================================================== */
function handleSignupTerms(event) {
    event.preventDefault();
    clearError('termsError');

    const terms1 = document.getElementById('agreeTerms1').checked;
    const terms2 = document.getElementById('agreeTerms2').checked;

    if (!terms1 || !terms2) {
        setError('termsError', '필수 약관에 동의해주세요.');
        return false;
    }

    showCard('signupCard');
    return false;
}

function toggleAllTerms(checkbox) {
    document.querySelectorAll('.term-item').forEach(item => {
        item.checked = checkbox.checked;
    });
    clearError('termsError');
}

function syncAllTerms() {
    const items = document.querySelectorAll('.term-item');
    const allChecked = [...items].every(i => i.checked);
    document.getElementById('agreeAll').checked = allChecked;
    clearError('termsError');
}

function viewTerms(termName) {
    showToast(`[${termName}] 약관 전문은 서비스 출시 후 확인 가능합니다.`, 'info');
}

/* ===================================================
   본인인증 시뮬레이션 (회원가입)
=================================================== */
function simulateVerification(type) {
    const typeName = type === 'phone' ? '휴대폰' : '아이핀';
    showToast(`${typeName} 본인인증을 진행합니다...`, 'info');

    setTimeout(() => {
        // 인증 성공 시 이름, 생년월일, 휴대폰번호 자동입력 (시뮬레이션)
        document.getElementById('signupName').value = '홍길동';
        document.getElementById('signupBirth').value = '1990-01-01';
        document.getElementById('signupMobile').value = '010-1234-5678';
        isVerified = true;
        clearError('verifyError');
        showToast('본인인증이 완료되었습니다.', 'success');
    }, 1500);
}

/* ===================================================
   주소 검색 시뮬레이션
=================================================== */
function searchAddress() {
    showToast('주소 검색 기능은 서비스 연동 후 사용 가능합니다.', 'info');

    // 실제 구현 시: Kakao 우편번호 서비스 API 연동
    // 시뮬레이션: 샘플 주소 자동입력
    setTimeout(() => {
        document.getElementById('signupPostcode').value = '04524';
        document.getElementById('signupAddr1').value = '서울특별시 중구 세종대로 110';
    }, 500);
}

/* ===================================================
   이메일 도메인 선택
=================================================== */
function setEmailDomain(value) {
    const domainInput = document.getElementById('signupEmailDomain');
    if (value === '' || value === 'direct') {
        domainInput.value = '';
        domainInput.readOnly = false;
        domainInput.focus();
    } else {
        domainInput.value = value;
        domainInput.readOnly = true;
    }
}

/* ===================================================
   회원가입 Step 2: 개인정보 입력
=================================================== */
function handleSignup(event) {
    event.preventDefault();

    const id = document.getElementById('signupId').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupPasswordConfirm').value;
    const emailLocal = document.getElementById('signupEmailLocal').value.trim();
    const emailDomain = document.getElementById('signupEmailDomain').value.trim();

    clearAllErrors('signupIdError', 'signupPasswordError', 'signupPasswordConfirmError', 'verifyError', 'signupEmailError');

    let hasError = false;

    // 아이디 검사
    const idErr = validateId(id);
    if (idErr) { setError('signupIdError', idErr); hasError = true; }

    // 비밀번호 검사
    const pwErr = validatePasswordSignup(password);
    if (pwErr) { setError('signupPasswordError', pwErr); hasError = true; }

    // 비밀번호 확인 검사
    if (!confirm) {
        setError('signupPasswordConfirmError', '비밀번호 확인을 입력해주세요.');
        hasError = true;
    } else if (password !== confirm) {
        setError('signupPasswordConfirmError', '비밀번호가 일치하지 않습니다.');
        hasError = true;
    }

    // 본인인증 확인
    if (!isVerified) {
        setError('verifyError', '본인인증을 완료해주세요.');
        hasError = true;
    }

    // 이메일 형식 검사 (입력한 경우)
    if (emailLocal || emailDomain) {
        if (!emailLocal || !emailDomain) {
            setError('signupEmailError', '이메일 주소를 올바르게 입력해주세요.');
            hasError = true;
        } else if (!/^[^\s@]+$/.test(emailLocal)) {
            setError('signupEmailError', '이메일 형식이 올바르지 않습니다.');
            hasError = true;
        }
    }

    if (hasError) return false;

    // 로딩 상태
    const btn = event.target.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = originalText;

        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.id === id)) {
            setError('signupIdError', '이미 사용 중인 아이디입니다.');
            return;
        }

        const email = (emailLocal && emailDomain) ? `${emailLocal}@${emailDomain}` : '';
        const name = document.getElementById('signupName').value;

        users.push({
            id,
            name,
            password,
            email,
            mobile: document.getElementById('signupMobile').value,
            birth: document.getElementById('signupBirth').value,
            agreeSMS: document.getElementById('agreeSMS').checked,
            agreeEmailReceive: document.getElementById('agreeEmailReceive').checked,
        });
        localStorage.setItem('users', JSON.stringify(users));

        isVerified = false;
        document.getElementById('successTitle').textContent = '가입 완료!';
        document.getElementById('successMessage').textContent = `${name}님, 회원가입이 완료되었습니다. 로그인해주세요.`;
        showCard('successCard');
    }, 1200);

    return false;
}

/* ===================================================
   아이디 찾기
=================================================== */
function findIdByAuth(type) {
    const typeName = type === 'phone' ? '휴대폰' : '아이핀';
    showToast(`${typeName} 인증 모듈을 연결합니다...`, 'info');

    setTimeout(() => {
        // 시뮬레이션: 인증 후 아이디 마스킹 노출
        document.getElementById('successTitle').textContent = '아이디 찾기 완료';
        document.getElementById('successMessage').textContent = '회원님의 아이디: test****r\n(보안을 위해 일부 마스킹 처리됩니다)';
        showCard('successCard');
    }, 1500);
}

/* ===================================================
   비밀번호 찾기
=================================================== */
function forgotByAuth(type) {
    const idInput = document.getElementById('forgotId');
    const id = idInput.value.trim();
    clearError('forgotIdError');

    const idErr = validateId(id);
    if (idErr) {
        setError('forgotIdError', idErr);
        return;
    }

    const typeName = type === 'phone' ? '휴대폰' : '아이핀';
    showToast(`${typeName} 인증 모듈을 연결합니다...`, 'info');

    setTimeout(() => {
        document.getElementById('successTitle').textContent = '임시 비밀번호 발송';
        document.getElementById('successMessage').textContent = `인증이 완료되었습니다.\n임시 비밀번호를 SMS 및 이메일로 발송했습니다.`;
        showCard('successCard');
    }, 1500);
}

/* ===================================================
   소셜 로그인
=================================================== */
function socialLogin(provider) {
    showToast(`${provider} 로그인은 서버 연동 후 사용 가능합니다.`, 'info');
}

/* ===================================================
   페이지 로드 시 초기화
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 아이디 저장 복원
    const savedId = localStorage.getItem('savedId');
    if (savedId) {
        document.getElementById('loginId').value = savedId;
        document.getElementById('saveId').checked = true;
    }

    // 자동 로그인 체크 (설정되어 있으면 자동 로그인 시도)
    const autoId = localStorage.getItem('autoLoginId');
    const autoPw = localStorage.getItem('autoLoginPw');
    if (autoId && autoPw) {
        document.getElementById('loginId').value = autoId;
        document.getElementById('loginPassword').value = autoPw;
        document.getElementById('autoLogin').checked = true;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === autoId && u.password === autoPw);
        if (user) {
            setTimeout(() => {
                showToast(`자동 로그인 - ${user.name}님, 환영합니다!`, 'success');
            }, 500);
        }
    }

    // 로그인 아이디 입력 시 실시간 소문자 변환
    const loginIdInput = document.getElementById('loginId');
    if (loginIdInput) {
        loginIdInput.addEventListener('input', () => {
            const pos = loginIdInput.selectionStart;
            loginIdInput.value = loginIdInput.value.toLowerCase();
            loginIdInput.setSelectionRange(pos, pos);
        });
    }
});
